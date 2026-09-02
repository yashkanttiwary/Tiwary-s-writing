import { getWritings } from '@/lib/content';

export async function submitToIndexNow(urls: string[]) {
  const host = process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'yashkanttiwary.com';
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    console.warn('INDEXNOW_KEY is not set. Skipping IndexNow submission.');
    return;
  }

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `https://${host}/${key}.txt`,
        urlList: urls,
      }),
    });

    if (!response.ok) {
      console.error('IndexNow submission failed:', await response.text());
    } else {
      console.log('IndexNow submission successful for URLs:', urls);
    }
  } catch (error) {
    console.error('Error submitting to IndexNow:', error);
  }
}
