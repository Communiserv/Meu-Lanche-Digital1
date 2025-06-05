
import React from 'react';
import Card from '@components/ui/Card';

interface QRCodeDisplayProps {
  value: string;
  studentName?: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, studentName }) => {
  // In a real app, you'd use a library like qrcode.react to generate an actual QR code image.
  // For this example, we'll just display the value and a placeholder.
  return (
    <Card title={studentName ? `QR Code de ${studentName}` : "Seu QR Code"} className="text-center">
      <div className="my-4 p-4 border-4 border-dashed border-gray-300 bg-gray-50 rounded-lg aspect-square flex items-center justify-center">
        {/* Placeholder for actual QR code image */}
        <p className="text-gray-600 text-lg font-mono break-all">
            {`[QR Img: ${value}]`}
        </p>
      </div>
      <p className="text-sm text-gray-500">Apresente este código na cantina para suas compras.</p>
      <p className="font-mono text-xs mt-2 bg-gray-100 p-2 rounded break-all">Valor: {value}</p>
    </Card>
  );
};

export default QRCodeDisplay;
    