import React, { useState } from 'react';
import { 
  X,
  FolderOpen,
  Tag,
  FileText,
  DollarSign,
  Copy,
  Play
} from 'lucide-react';

interface TimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TimeEntryData) => void;
  initialData?: TimeEntryData;
}

interface TimeEntryData {
  description: string;
  startTime: string;
  endTime: string;
  project?: string;
  tags?: string[];
  billable?: boolean;
}

const TimeEntryModal: React.FC<TimeEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [description, setDescription] = useState(initialData?.description || '');
  const [startTime, setStartTime] = useState(initialData?.startTime || '3:22 AM');
  const [endTime, setEndTime] = useState(initialData?.endTime || '3:23 AM');

  const handleSave = () => {
    onSave({
      description,
      startTime,
      endTime,
      project: initialData?.project,
      tags: initialData?.tags,
      billable: initialData?.billable
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Add a description</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Add a description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-400 border border-gray-600 hover:border-gray-500 transition-colors"
            autoFocus
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            className="p-3 hover:bg-gray-700 rounded-lg transition-colors group"
            title="Select project"
          >
            <FolderOpen className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
          </button>
          <button 
            className="p-3 hover:bg-gray-700 rounded-lg transition-colors group"
            title="Add tag"
          >
            <Tag className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
          </button>
          <button 
            className="p-3 hover:bg-gray-700 rounded-lg transition-colors group"
            title="Add note"
          >
            <FileText className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
          </button>
          <button 
            className="p-3 hover:bg-gray-700 rounded-lg transition-colors group"
            title="Set billable rate"
          >
            <DollarSign className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
          </button>
        </div>

        {/* Time Range */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm text-gray-300">
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
              <span className="font-medium">{startTime}</span>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <span className="text-gray-500 hidden sm:inline">→</span>
            <div className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg">
              <span className="font-medium">{endTime}</span>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors group">
              <Play className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg shadow-purple-600/25"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeEntryModal;
