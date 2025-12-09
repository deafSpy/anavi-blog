import crypto from 'crypto';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export async function POST({ request }: { request: Request }) {
  try {
    const signature = request.headers.get('X-CMSDocs-Signature');
    const eventType = request.headers.get('X-CMSDocs-Event');
    const secret = process.env.CMSDOCS_WEBHOOK_SECRET;
    const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;

    if (!signature || !secret || !eventType || !deployHookUrl) {
      console.error('Missing configuration:', {
        hasSignature: !!signature,
        hasSecret: !!secret,
        hasEventType: !!eventType,
        hasDeployHook: !!deployHookUrl,
      });
      return json({ error: 'Missing required headers or configuration' }, 401);
    }

    const body = await request.json();
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(body));
    const computedSignature = hmac.digest('hex');

    if (signature !== computedSignature) {
      console.error('Invalid signature');
      return json({ error: 'Invalid signature' }, 401);
    }

    const response = await fetch(deployHookUrl, { method: 'POST' });
    if (!response.ok) {
      throw new Error(`Deploy hook failed: ${response.status}`);
    }

    return json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
}

