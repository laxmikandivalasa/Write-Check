import React, { useState, useEffect } from 'react';

const UploadForm = () => {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [fileType, setFileType] = useState('text'); // Default to text-based
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [uploadBtnColor, setUploadBtnColor] = useState('bg-blue-600');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch('http://localhost:5000/files');
      const data = await res.json();
      setUploadedFiles(data.files);
    } catch (err) {
      console.error(err);
      setUploadStatus('Error fetching file list');
    }
  };

  const handleChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      setUploadStatus('Please select at least one file.');
      return;
    }

    setUploadStatus('Uploading...');
    setUploadBtnColor('bg-blue-400');

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const res = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setUploadStatus(`Files uploaded successfully: ${data.files.join(', ')}`);
        fetchFiles();
        setUploadBtnColor('bg-green-600');
      } else {
        setUploadStatus(`Error: ${data.error}`);
        setUploadBtnColor('bg-red-600');
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('Upload failed. Server not reachable.');
      setUploadBtnColor('bg-red-600');
    }
  };

  const handleCheckDuplicates = async () => {
    try {
      const res = await fetch('http://localhost:5000/check_duplicates');
      const data = await res.json();
      if (res.ok) {
        setDuplicates(data.duplicates);
        if (data.duplicates.length === 0) {
          setUploadStatus('No duplicates found.');
        }
      } else {
        setUploadStatus('Error checking duplicates.');
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('Error checking duplicates.');
    }
  };

  const handleDeleteFile = async (filename) => {
    try {
      const res = await fetch(`http://localhost:5000/delete/${filename}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchFiles();
      } else {
        setUploadStatus('Failed to delete file');
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('Error deleting file');
    }
  };

  return (
    <div className="upload-form max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="file-type-buttons flex gap-4 justify-center mb-4">
        <button
          onClick={() => {
            setFileType('text');
            setUploadStatus('You can upload .pdf, .doc, .docx files');
          }}
          className={`px-4 py-2 rounded-md ${fileType === 'text' ? 'bg-blue-700' : 'bg-blue-600'} text-white hover:bg-blue-700`}
        >
          Text-based Files
        </button>
        <button
          onClick={() => {
            setFileType('handwritten');
            setUploadStatus('You can upload images of handwritten assignments');
          }}
          className={`px-4 py-2 rounded-md ${fileType === 'handwritten' ? 'bg-blue-700' : 'bg-blue-600'} text-white hover:bg-blue-700`}
        >
          Handwritten Files
        </button>
      </div>

      <p className="text-center mb-4 text-sm text-gray-700">{uploadStatus}</p>

      <form
        onSubmit={handleUpload}
        className="flex flex-col items-center gap-4"
      >
        <input
          type="file"
          multiple
          accept={fileType === 'text' ? '.pdf, .doc, .docx' : 'image/*'}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-md"
        />
        <button
          type="submit"
          className={`px-4 py-2 rounded-md ${uploadBtnColor} text-white hover:bg-blue-700`}
        >
          Upload
        </button>
      </form>

      <div className="uploaded-files mt-6">
        <h3 className="text-lg font-semibold">Uploaded Files</h3>
        <ul className="list-disc ml-5 space-y-2">
          {uploadedFiles.map((filename) => (
            <li key={filename} className="flex items-center justify-between">
              {filename}
              <button
                onClick={() => handleDeleteFile(filename)}
                className="ml-2 text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="check-duplicates mt-6">
        <button
          onClick={handleCheckDuplicates}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
        >
          Check for Duplicates
        </button>
        {duplicates.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold">Possible Duplicates:</h4>
            <ul className="list-disc ml-5">
              {duplicates.map(([file1, file2, score], index) => (
                <li key={index}>
                  {file1} ⟷ {file2} → Similarity: {(score * 100).toFixed(2)}%
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadForm;
