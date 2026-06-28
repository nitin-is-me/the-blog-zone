import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const processHtmlImages = async (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const images = doc.querySelectorAll('img');
  const urlMap = {};
  
  for (let img of images) {
    if (img.src.startsWith('blob:')) {
      try {
        const blobUrl = img.src;
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        const fileExt = blob.type.split('/')[1] || 'png';
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        
        const { error } = await supabase.storage.from('blog-images').upload(fileName, blob);
        if (error) throw error;
        
        const { data: publicUrlData } = supabase.storage.from('blog-images').getPublicUrl(fileName);
        img.src = publicUrlData.publicUrl;
        urlMap[blobUrl] = publicUrlData.publicUrl;
      } catch (error) {
        console.error('Failed to upload blob image:', error);
      }
    }
  }
  return { html: doc.body.innerHTML, urlMap };
};
