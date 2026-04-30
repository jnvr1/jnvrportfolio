/**
 * Unit tests for contact-form.ts submit logic.
 * Uses vi.fn() to mock fetch — no real HTTP calls.
 *
 * TDD: written RED before implementing submitContactForm / validateContactForm.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitContactForm, validateContactForm } from '../../src/scripts/contact-form';
import type { EmailParams } from '../../src/config/contact';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const validParams: EmailParams = {
  from_name: 'Ana García',
  reply_to: 'ana@example.com',
  subject: 'Consulta de proyecto',
  message: 'Hola, me gustaría hablar sobre un proyecto.',
};

function makeFetch(status: number, ok: boolean): typeof fetch {
  return vi.fn().mockResolvedValue({ ok, status } as Response);
}

function makeFailingFetch(): typeof fetch {
  return vi.fn().mockRejectedValue(new Error('Network error'));
}

// ---------------------------------------------------------------------------
// validateContactForm
// ---------------------------------------------------------------------------
describe('validateContactForm', () => {
  it('returns empty errors for a fully valid input', () => {
    const errors = validateContactForm({
      name: 'Ana García',
      email: 'ana@example.com',
      message: 'Test message',
    });
    expect(errors).toEqual({});
  });

  it('returns nameRequired when name is empty', () => {
    const errors = validateContactForm({
      name: '',
      email: 'ana@example.com',
      message: 'Test',
    });
    expect(errors).toHaveProperty('name', 'nameRequired');
  });

  it('returns nameRequired when name is only whitespace', () => {
    const errors = validateContactForm({
      name: '   ',
      email: 'ana@example.com',
      message: 'Test',
    });
    expect(errors).toHaveProperty('name', 'nameRequired');
  });

  it('returns emailRequired when email is empty', () => {
    const errors = validateContactForm({
      name: 'Ana',
      email: '',
      message: 'Test',
    });
    expect(errors).toHaveProperty('email', 'emailRequired');
  });

  it('returns emailInvalid when email has no @ sign', () => {
    const errors = validateContactForm({
      name: 'Ana',
      email: 'notanemail',
      message: 'Test',
    });
    expect(errors).toHaveProperty('email', 'emailInvalid');
  });

  it('returns emailInvalid when email is missing domain', () => {
    const errors = validateContactForm({
      name: 'Ana',
      email: 'ana@',
      message: 'Test',
    });
    expect(errors).toHaveProperty('email', 'emailInvalid');
  });

  it('returns messageRequired when message is empty', () => {
    const errors = validateContactForm({
      name: 'Ana',
      email: 'ana@example.com',
      message: '',
    });
    expect(errors).toHaveProperty('message', 'messageRequired');
  });

  it('returns multiple errors when multiple fields are invalid', () => {
    const errors = validateContactForm({
      name: '',
      email: '',
      message: '',
    });
    expect(Object.keys(errors)).toHaveLength(3);
  });

  it('does NOT return email error for valid subdomain address', () => {
    const errors = validateContactForm({
      name: 'Ana',
      email: 'ana@mail.example.co.uk',
      message: 'Test',
    });
    expect(errors).not.toHaveProperty('email');
  });
});

// ---------------------------------------------------------------------------
// submitContactForm
// ---------------------------------------------------------------------------
describe('submitContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns ok:true on HTTP 200', async () => {
    const mockFetch = makeFetch(200, true);
    const result = await submitContactForm(validParams, mockFetch);
    expect(result).toEqual({ ok: true });
  });

  it('calls fetch with POST method', async () => {
    const mockFetch = makeFetch(200, true);
    await submitContactForm(validParams, mockFetch);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.emailjs.com/api/v1.0/email/send',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sends Content-Type: application/json header', async () => {
    const mockFetch = makeFetch(200, true);
    await submitContactForm(validParams, mockFetch);
    const [, options] = (mockFetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect((options as RequestInit).headers).toMatchObject({
      'Content-Type': 'application/json',
    });
  });

  it('includes service_id, template_id, user_id in the body', async () => {
    const mockFetch = makeFetch(200, true);
    await submitContactForm(validParams, mockFetch);
    const [, options] = (mockFetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body).toMatchObject({
      service_id: 'service_kn6nd2f',
      template_id: 'template_l96zv27',
      user_id: 'ZImFvPBUGE-I7sQxa',
    });
  });

  it('maps EmailParams correctly to template_params', async () => {
    const mockFetch = makeFetch(200, true);
    await submitContactForm(validParams, mockFetch);
    const [, options] = (mockFetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body.template_params).toEqual({
      from_name: validParams.from_name,
      reply_to: validParams.reply_to,
      subject: validParams.subject,
      message: validParams.message,
    });
  });

  it('returns ok:false with error:"httpError" on HTTP 4xx', async () => {
    const mockFetch = makeFetch(422, false);
    const result = await submitContactForm(validParams, mockFetch);
    expect(result).toEqual({ ok: false, error: 'httpError' });
  });

  it('returns ok:false with error:"httpError" on HTTP 500', async () => {
    const mockFetch = makeFetch(500, false);
    const result = await submitContactForm(validParams, mockFetch);
    expect(result).toEqual({ ok: false, error: 'httpError' });
  });

  it('returns ok:false with error:"networkError" when fetch rejects', async () => {
    const mockFetch = makeFailingFetch();
    const result = await submitContactForm(validParams, mockFetch);
    expect(result).toEqual({ ok: false, error: 'networkError' });
  });

  it('does NOT throw when fetch rejects — always returns a result', async () => {
    const mockFetch = makeFailingFetch();
    await expect(submitContactForm(validParams, mockFetch)).resolves.toBeDefined();
  });
});
