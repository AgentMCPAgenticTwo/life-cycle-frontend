import { useRef, useState } from 'react';

const TABS = ['Draw', 'Type', 'Upload'];

/**
 * Mandatory Signature Pad supporting Draw/Type/Upload, enabled only when it
 * is the signer's turn (UC7-BR-001 / UC7-BR-004 / UC7-BR-017 / UC7-BR-019 / UC7-FV-003).
 *
 * Named SignaturePadModal per the module contract; rendered inline as a card
 * on the signing portal page to match the target design, not as an overlay.
 */
export default function SignaturePadModal({ sessionId: _sessionId, onSign, disabled, isSubmitting, error }) {
  const [activeTab, setActiveTab] = useState('Draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [uploadedData, setUploadedData] = useState(null);
  const [uploadedName, setUploadedName] = useState('');
  const [formError, setFormError] = useState(null);
  const [hasDrawing, setHasDrawing] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  function getCanvasContext() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }

  function pointerPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  function handlePointerDown(e) {
    if (disabled) return;
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (!canvas || !ctx) return;
    isDrawing.current = true;
    const { x, y } = pointerPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function handlePointerMove(e) {
    if (!isDrawing.current || disabled) return;
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (!canvas || !ctx) return;
    const { x, y } = pointerPos(e, canvas);
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 2;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawing(true);
  }

  function handlePointerUp() {
    isDrawing.current = false;
  }

  function clearDrawing() {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  }

  function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedName(file.name);
    const reader = new FileReader();
    reader.onload = () => setUploadedData(reader.result);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    let signatureData = null;
    if (activeTab === 'Draw') {
      if (hasDrawing) signatureData = canvasRef.current.toDataURL('image/png');
    } else if (activeTab === 'Type') {
      if (typedSignature.trim()) signatureData = typedSignature.trim();
    } else if (activeTab === 'Upload') {
      signatureData = uploadedData;
    }

    if (!signatureData) {
      setFormError('Signature Pad is mandatory — draw, type or upload your signature before signing.');
      return;
    }

    onSign({ signatureData, signatureType: activeTab });
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
      <h2 className="text-sm font-semibold text-neutral-100">Apply your signature</h2>
      <p className="mt-1 text-xs text-neutral-500">Draw, type or upload your signature to complete signing</p>

      <div className="mt-4 inline-flex rounded-md border border-neutral-700 bg-neutral-950 p-0.5">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            disabled={disabled}
            onClick={() => setActiveTab(tab)}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
        <label className="text-sm font-medium text-neutral-200">Signature*</label>

        {activeTab === 'Draw' && (
          <div>
            <canvas
              ref={canvasRef}
              width={560}
              height={120}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              className={`w-full rounded-md border border-neutral-700 bg-neutral-950 ${disabled ? 'opacity-50' : ''}`}
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-neutral-500">Draw your signature here. Or type / upload instead</p>
              <button
                type="button"
                onClick={clearDrawing}
                disabled={disabled}
                className="text-xs font-medium text-neutral-400 hover:text-neutral-200"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Type' && (
          <div>
            <input
              type="text"
              value={typedSignature}
              onChange={(e) => setTypedSignature(e.target.value)}
              disabled={disabled}
              placeholder="Type your full name as your signature"
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-neutral-500">Draw your signature here. Or type / upload instead</p>
          </div>
        )}

        {activeTab === 'Upload' && (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={disabled}
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 disabled:opacity-50"
            />
            {uploadedName && <p className="mt-1 text-xs text-neutral-400">{uploadedName} selected</p>}
            <p className="mt-1 text-xs text-neutral-500">Draw your signature here. Or type / upload instead</p>
          </div>
        )}

        {formError && (
          <p role="alert" className="text-xs text-red-300">
            {formError}
          </p>
        )}
        {error && (
          <p role="alert" className="text-xs text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={disabled || isSubmitting}
          className="self-start rounded-md bg-emerald-500 px-5 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing…' : 'Sign'}
        </button>
      </form>
    </div>
  );
}
