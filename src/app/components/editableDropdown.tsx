import React, { useState, useRef, useEffect } from 'react';

interface EditableDropdownProps<T> {
  items: T[];
  selectedItems?: T[];
  label?: string;
  isMultiSelect?: boolean;
  isEditable?: boolean;
  onSelectionChange: (selected: T[]) => void;
  onAddItem?: (newItem: T) => void;
}

export function EditableDropdown<T>({
  items,
  selectedItems = [],
  label = '',
  isMultiSelect = false,
  isEditable = false,
  onSelectionChange,
  onAddItem,
}: EditableDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<T[]>(selectedItems);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredItems = items.filter((item) =>
    String(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNewItem = () => {
    if (isEditable && searchTerm && !items.includes(searchTerm as unknown as T)) {
      onAddItem?.(searchTerm as unknown as T);
      setSearchTerm('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: T) => {
    if (isMultiSelect) {
      const updatedSelection = selected.includes(item)
        ? selected.filter((i) => i !== item)
        : [...selected, item];
      setSelected(updatedSelection);
      onSelectionChange(updatedSelection);
    } else {
      setSelected([item]);
      onSelectionChange([item]);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      <div
        className="border border-gray-300 rounded-md shadow-sm cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between p-2">
          <div className="flex flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map((item, index) => (
                <span
                  key={index}
                  className="bg-gray-100 px-2 py-1 rounded-md text-sm"
                >
                  {String(item)}
                </span>
              ))
            ) : (
              <span className="text-gray-500">Select</span>
            )}
          </div>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {isEditable && (
            <div className="p-2 border-b">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search or add new..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && !filteredItems.length && (
                  <button
                    onClick={handleAddNewItem}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="max-h-60 overflow-auto">
            {filteredItems.map((item, index) => (
              <div
                key={index}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                  selected.includes(item) ? 'bg-green-50' : ''
                }`}
                onClick={() => handleSelect(item)}
              >
                <div className="flex items-center">
                  {isMultiSelect && (
                    <div className="relative w-6 h-6 mr-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(item)}
                        className="w-6 h-6 rounded-md border-2 border-gray-300 
                        checked:bg-green-500 checked:border-green-500
                        appearance-none cursor-pointer transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        onChange={() => {}}
                      />
                      {selected.includes(item) && (
                        <svg
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                  )}
                  <span className={selected.includes(item) ? 'text-green-700 font-medium' : ''}>
                    {String(item)}
                  </span>
                </div>
              </div>
            ))}
            {searchTerm && !filteredItems.length && (
              <div className="px-4 py-2 text-gray-500 italic">
                Press Add button to create new item
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}