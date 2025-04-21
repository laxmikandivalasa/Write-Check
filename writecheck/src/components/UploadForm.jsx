// UploadForm.jsx
import React, { useState } from 'react';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setUploadStatus('Please select a file.');
      return;
    }

    setUploadStatus('Uploading...');

    // Simulate an upload (we’ll connect real backend later)
    setTimeout(() => {
      setUploadStatus('Upload successful (fake for now 🚀)');
    }, 1000);
  };

  return (
    <form
      onSubmit={handleUpload}
      className="flex flex-col items-center gap-4 mt-10 bg-white p-6 rounded-xl shadow-md max-w-md mx-auto"
    >
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-md"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Upload
      </button>
      {uploadStatus && <p className="text-sm text-gray-700">{uploadStatus}</p>}
    </form>
  );
};

export default UploadForm;
