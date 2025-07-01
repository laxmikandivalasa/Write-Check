import React, { useState, useEffect } from 'react';
import { Upload, FileText, Image, Trash2, Search } from 'lucide-react'; // Optional: using lucide-react icons

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
        fetchFiles(); // Refresh file list
      } else {
        const data = await res.json();
        setUploadStatus(data.error || 'Failed to delete file');
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('Error deleting file');
    }
  };




  return (
    <div className="upload-form max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
      <div className="file-type-buttons flex gap-4 justify-center mb-6">
        <button
          onClick={() => {
            setFileType('text');
            setUploadStatus('You can upload .pdf, .doc, .docx files');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 text-white ${fileType === 'text' ? 'bg-blue-900' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          <FileText size={18} />
          Text-based Files
        </button>
        <button
          onClick={() => {
            setFileType('handwritten');
            setUploadStatus('You can upload images of handwritten assignments');
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 text-white ${fileType === 'handwritten' ? 'bg-blue-900' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          <Image size={18} />
          Handwritten Files
        </button>
      </div>

      <p className="text-center mb-6 text-sm text-gray-600 italic">{uploadStatus}</p>

      <form onSubmit={handleUpload} className="flex flex-col items-center gap-4">
        <label className="w-full cursor-pointer">
          <input
            type="file"
            multiple
            accept={fileType === 'text' ? '.pdf, .doc, .docx' : 'image/*'}
            onChange={handleChange}
            className="hidden"
          />
          <div className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-400 rounded-lg hover:border-blue-500 transition-colors">
            <Upload size={20} />
            <span className="text-gray-700">Click to choose files</span>
          </div>
        </label>
        <button
          type="submit"
          className={`px-6 py-2.5 rounded-md ${uploadBtnColor} text-white hover:bg-blue-800 transition-all`}
        >
          Upload
        </button>
      </form>

      <div className="uploaded-files mt-8">
        <h3 className="text-lg font-bold mb-2 text-gray-800">Uploaded Files</h3>
        {uploadedFiles.length > 0 ? (
          <ul className="space-y-2">
            {uploadedFiles.map((filename) => (
              <li key={filename} className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-md">
                <span className="truncate">{filename}</span>
                <button
                  onClick={() => handleDeleteFile(filename)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic">No files uploaded yet.</p>
        )}
      </div>

      <div className="check-duplicates mt-8 text-center">
        <button
          onClick={handleCheckDuplicates}
          className="inline-flex items-center gap-2 px-5 py-2 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition-all"
        >
          <Search size={18} />
          Check for Duplicates
        </button>

        {duplicates.length > 0 && (
          <div className="mt-6 text-left">
            <h4 className="font-semibold text-gray-800">Possible Duplicates:</h4>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-700">
              {duplicates.map(([file1, file2, score], index) => (
                <li key={index}>
                  <span className="font-medium">{file1}</span> ⟷ <span className="font-medium">{file2}</span> → Similarity:{" "}
                  <span className="text-yellow-700 font-semibold">{(score * 100).toFixed(2)}%</span>
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
