const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.improveText = async (req, res) => {
  try {
    const { text, prompt } = req.body;
    if (!text || !prompt) {
      return res.status(400).json({ message: 'Text and prompt are required' });
    }

    let systemMessage = '';
    if (prompt === 'improve_writing') {
      systemMessage = 'You are an expert editor. Improve the overall quality of the writing. Fix grammar, spelling, punctuation, and awkward phrasing. Improve clarity, sentence flow, and readability. Preserve the author\'s original tone and meaning. Do not make the writing unnecessarily formal. Do not add new ideas or remove important information. Return ONLY the rewritten text. DO NOT wrap the output in dashes (---), quotes, or markdown blocks. Provide absolutely no conversational filler.';
    } else if (prompt === 'make_concise') {
      systemMessage = 'You are an expert editor. Rewrite the text to be shorter and more concise. Remove unnecessary words, repetition, and filler. Preserve all important information and the original meaning. Return ONLY the rewritten text. DO NOT wrap the output in dashes (---), quotes, or markdown blocks. Provide absolutely no conversational filler.';
    } else if (prompt === 'simplify') {
      systemMessage = 'You are an expert editor. Rewrite the text so it is easier to understand. Use simpler vocabulary where appropriate. Break up complex sentences. Preserve the original meaning and important details. Return ONLY the rewritten text. DO NOT wrap the output in dashes (---), quotes, or markdown blocks. Provide absolutely no conversational filler.';
    } else if (prompt === 'make_engaging') {
      systemMessage = 'You are an expert editor. Rewrite the text to be more engaging and enjoyable to read. Improve flow, transitions, and sentence variety. Make the writing feel natural and compelling. Do not exaggerate, use clickbait, or change the author\'s intent. Return ONLY the rewritten text. DO NOT wrap the output in dashes (---), quotes, or markdown blocks. Provide absolutely no conversational filler.';
    } else if (prompt === 'expand') {
      systemMessage = 'You are an expert writer. Expand the text by adding relevant detail, explanation, or context. Maintain the original tone and intent. Do not repeat information. Do not invent facts or introduce unrelated ideas. Return ONLY the expanded text. DO NOT wrap the output in dashes (---), quotes, or markdown blocks. Provide absolutely no conversational filler.';
    } else {
      return res.status(400).json({ message: 'Invalid prompt type' });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: text }
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.5,
      max_tokens: 1024,
    });

    let result = completion.choices[0]?.message?.content || text;
    res.status(200).json({ result });
  } catch (error) {
    console.error('Groq AI Error:', error);
    res.status(500).json({ message: 'Failed to improve text with AI.' });
  }
};

exports.summarizeBlog = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Blog content is required' });
    }

    const systemMessage = 'You are a helpful assistant. Provide a highly concise, 3-bullet-point summary of the following blog post content. Return ONLY the bullet points, formatted as a markdown list (using -). No conversational filler or introductory text. Just the 3 bullet points.';

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: content }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 500,
    });

    const summary = completion.choices[0]?.message?.content || '';
    res.status(200).json({ summary });
  } catch (error) {
    console.error('Groq AI Error:', error);
    res.status(500).json({ message: 'Failed to summarize blog with AI.' });
  }
};
