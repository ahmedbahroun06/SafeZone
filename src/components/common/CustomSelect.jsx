import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder, icon: Icon, className = '', style = {}, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`custom-select-wrapper ${className}`} ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        className="form-control"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: '0.75rem 1rem',
          userSelect: 'none',
          opacity: disabled ? 0.6 : 1,
          width: '100%',
          backgroundColor: 'transparent',
          ...style
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {Icon && (
          <div style={{ color: 'var(--clr-text-muted)', display: 'flex', marginRight: '0.75rem', flexShrink: 0 }}>
            <Icon size={18} />
          </div>
        )}
        <div style={{ flex: 1, textAlign: 'left', color: value ? 'var(--clr-text)' : 'var(--clr-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {options.find(o => (typeof o === 'object' ? o.value === value : o === value))?.label || value || placeholder}
        </div>
        <div style={{ marginLeft: '0.5rem', display: 'flex', flexShrink: 0 }}>
          <ChevronDown size={16} color="var(--clr-text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.5rem',
              backgroundColor: 'var(--clr-surface)',
              border: '1px solid var(--clr-border)',
              borderRadius: 'var(--r-md)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 50,
              maxHeight: '250px',
              overflowY: 'auto'
            }}
          >
            <div 
              style={{
                padding: '0.75rem 1rem',
                cursor: 'pointer',
                color: 'var(--clr-text-muted)',
                borderBottom: '1px solid var(--clr-border)',
                fontSize: '0.9rem'
              }}
              onClick={() => { onChange(''); setIsOpen(false); }}
            >
              {placeholder}
            </div>
            {options.map((opt, idx) => {
              const isObj = typeof opt === 'object';
              const optValue = isObj ? opt.value : opt;
              const optLabel = isObj ? opt.label : opt;
              
              return (
                <div 
                  key={idx}
                  style={{
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    color: value === optValue ? 'var(--clr-primary)' : 'var(--clr-text)',
                    backgroundColor: value === optValue ? 'var(--clr-primary-ultra)' : 'transparent',
                    fontWeight: value === optValue ? 700 : 500,
                    transition: 'background-color 0.2s ease',
                    fontSize: '0.9rem'
                  }}
                  onClick={() => { onChange(optValue); setIsOpen(false); }}
                  onMouseEnter={(e) => { if (value !== optValue) e.currentTarget.style.backgroundColor = 'var(--clr-bg-raised)' }}
                  onMouseLeave={(e) => { if (value !== optValue) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  {optLabel}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSelect;
