/**
 * Umedia Contact Form Handler
 * Cloudflare Worker + Resend API
 *
 * Environment Variables:
 *   RESEND_API_KEY - Your Resend API key
 *   RECIPIENT_EMAIL - Where to receive form submissions
 *   ALLOWED_ORIGINS - Comma-separated list of allowed origins (optional)
 */

// 支持的來源域名（根據實際部署更新）
const ALLOWED_ORIGINS = [
  'https://umedia.com.hk',
  'https://www.umedia.com.hk',
  'http://localhost:8787',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
];

// 簡單的速率限制存儲（使用 Cloudflare Workers KV 或 Durable Objects 可實現持久化）
const rateLimitMap = new Map();

function checkRateLimit(clientIP, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  const key = clientIP;
  const record = rateLimitMap.get(key);

  if (!record) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

function getClientIP(request) {
  return request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown';
}

function getCorsHeaders(origin, additionalHeaders = {}) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
    ...additionalHeaders,
  };
}

function jsonResponse(data, status = 200, origin = '') {
  return new Response(JSON.stringify(data), {
    status,
    headers: getCorsHeaders(origin, {
      'Content-Type': 'application/json; charset=utf-8',
    }),
  });
}

function validateFormData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('姓名至少需要 2 個字符');
  }

  if (!data.contact || data.contact.trim().length < 3) {
    errors.push('請提供有效的聯絡方式');
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push('需求描述至少需要 10 個字符');
  }

  if (data.name && data.name.length > 100) {
    errors.push('姓名過長');
  }

  if (data.company && data.company.length > 200) {
    errors.push('公司名稱過長');
  }

  if (data.message && data.message.length > 5000) {
    errors.push('需求描述過長');
  }

  return errors;
}

function sanitizeInput(str) {
  if (!str) return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .trim();
}

// 簡單的蜜罐欄位檢測（機器人通常會填寫隱藏欄位）
function checkHoneypot(formData) {
  // 如果存在 hp 欄位且有值，可能是機器人
  if (formData.hp && formData.hp.toString().trim().length > 0) {
    return false;
  }
  return true;
}

// 檢查是否包含常見垃圾郵件關鍵詞
function checkSpamContent(data) {
  const spamKeywords = [
    'viagra', 'cialis', 'casino', 'lottery', 'winner',
    'click here', 'buy now', 'free money', 'earn $',
    'http://', 'https://', 'www.', '.com', '.net',
  ];

  const text = `${data.name} ${data.company} ${data.contact} ${data.message}`.toLowerCase();
  const found = spamKeywords.filter(kw => text.includes(kw));

  return {
    isSpam: found.length >= 3,
    keywords: found,
  };
}

function buildEmailHtml(data) {
  const name = sanitizeInput(data.name);
  const company = sanitizeInput(data.company) || '未提供';
  const contact = sanitizeInput(data.contact);
  const interest = sanitizeInput(data.interest) || '未選擇';
  const message = sanitizeInput(data.message).replace(/\n/g, '<br>');
  const submittedAt = new Date().toLocaleString('zh-HK', {
    timeZone: 'Asia/Hong_Kong',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Umedia 新諮詢表單</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
    .header p { margin: 8px 0 0; opacity: 0.85; font-size: 14px; }
    .content { padding: 28px 24px; }
    .field { margin-bottom: 20px; }
    .field-label { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .field-value { font-size: 15px; color: #222; padding: 10px 14px; background: #f8f9fa; border-radius: 8px; border-left: 3px solid #e94560; }
    .field-value.message { line-height: 1.7; }
    .footer { padding: 20px 24px; background: #f8f9fa; text-align: center; font-size: 13px; color: #888; border-top: 1px solid #eee; }
    .badge { display: inline-block; background: #e94560; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">新諮詢</span>
      <h1>Umedia 產品諮詢表單</h1>
      <p>提交時間：${submittedAt}</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">姓名</div>
        <div class="field-value">${name}</div>
      </div>
      <div class="field">
        <div class="field-label">公司 / 門店</div>
        <div class="field-value">${company}</div>
      </div>
      <div class="field">
        <div class="field-label">聯絡方式</div>
        <div class="field-value">${contact}</div>
      </div>
      <div class="field">
        <div class="field-label">感興趣的方案</div>
        <div class="field-value">${interest}</div>
      </div>
      <div class="field">
        <div class="field-label">需求描述</div>
        <div class="field-value message">${message}</div>
      </div>
    </div>
    <div class="footer">
      此郵件由 Umedia 網站自動發送 | 請勿直接回覆
    </div>
  </div>
</body>
</html>`;
}

function buildEmailText(data) {
  const submittedAt = new Date().toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' });
  return `Umedia 新諮詢表單

提交時間：${submittedAt}

姓名：${data.name || '未提供'}
公司/門店：${data.company || '未提供'}
聯絡方式：${data.contact || '未提供'}
感興趣的方案：${data.interest || '未選擇'}

需求描述：
${data.message || '未提供'}

---
此郵件由 Umedia 網站自動發送`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin),
      });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return jsonResponse({ error: '僅支持 POST 請求' }, 405, origin);
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, 5, 60000); // 每分鐘最多 5 次
    if (!rateLimit.allowed) {
      return jsonResponse(
        { error: `請求過於頻繁，請 ${rateLimit.retryAfter} 秒後再試` },
        429,
        origin
      );
    }

    try {
      // Parse form data
      let formData;
      const contentType = request.headers.get('Content-Type') || '';

      if (contentType.includes('application/json')) {
        formData = await request.json();
      } else {
        // Parse FormData
        const fd = await request.formData();
        formData = {};
        for (const [key, value] of fd.entries()) {
          formData[key] = value;
        }
      }

      // Validate required fields
      const requiredFields = ['name', 'contact', 'message'];
      const missingFields = requiredFields.filter(f => !formData[f] || !formData[f].toString().trim());

      if (missingFields.length > 0) {
        return jsonResponse({
          error: '缺少必填欄位',
          missingFields,
        }, 400, origin);
      }

      // Additional validation
      const validationErrors = validateFormData(formData);
      if (validationErrors.length > 0) {
        return jsonResponse({
          error: '表單驗證失敗',
          errors: validationErrors,
        }, 400, origin);
      }

      // Honeypot check
      if (!checkHoneypot(formData)) {
        // 靜默成功，不讓機器人知道被攔截
        return jsonResponse({
          success: true,
          message: '提交成功，感謝你的查詢',
        }, 200, origin);
      }

      // Spam content check
      const spamCheck = checkSpamContent(formData);
      if (spamCheck.isSpam) {
        console.warn('Spam detected:', spamCheck.keywords, 'from IP:', clientIP);
        return jsonResponse({
          success: true,
          message: '提交成功，感謝你的查詢',
        }, 200, origin);
      }

      // Check environment variables
      if (!env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured');
        return jsonResponse({ error: '服務暫時不可用，請稍後再試' }, 500, origin);
      }

      if (!env.RECIPIENT_EMAIL) {
        console.error('RECIPIENT_EMAIL not configured');
        return jsonResponse({ error: '服務暫時不可用，請稍後再試' }, 500, origin);
      }

      // Build email content
      const emailHtml = buildEmailHtml(formData);
      const emailText = buildEmailText(formData);

      // Send email via Resend
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.FROM_EMAIL || 'Umedia <contact@umedia.com.hk>',
          to: env.RECIPIENT_EMAIL,
          subject: `【Umedia 諮詢】${formData.name} - ${formData.interest || '產品諮詢'}`,
          html: emailHtml,
          text: emailText,
          reply_to: formData.contact.includes('@') ? formData.contact : undefined,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.text();
        console.error('Resend API error:', errorData);
        return jsonResponse({ error: '郵件發送失敗，請稍後再試' }, 500, origin);
      }

      const resendData = await resendResponse.json();

      return jsonResponse({
        success: true,
        message: '提交成功，感謝你的查詢',
        id: resendData.id,
      }, 200, origin);

    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse({ error: '服務暫時不可用，請稍後再試' }, 500, origin);
    }
  },
};
