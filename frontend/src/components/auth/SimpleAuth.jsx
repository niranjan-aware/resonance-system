import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, User, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import Modal from '../common/Modal';
import Button from '../common/Button';

const SimpleAuth = () => {
  const { showAuthModal, setShowAuthModal, login, isLoading } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(true);
  const [errors, setErrors] = useState({});

  const validatePhone = (value) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!value) return 'Phone number is required';
    if (!phoneRegex.test(value)) return 'Please enter a valid 10-digit phone number';
    return null;
  };

  const validateName = (value) => {
    if (isNewUser && !value) return 'Name is required';
    if (isNewUser && value.length < 2) return 'Name must be at least 2 characters';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const phoneError = validatePhone(phone);
    const nameError = validateName(name);

    if (phoneError || nameError) {
      setErrors({
        phone: phoneError,
        name: nameError
      });
      return;
    }

    setErrors({});

    try {
      // await login({phone, });
      await login({phone, name: isNewUser ? name : null});
      setPhone('');
      setName('');
      setIsNewUser(false);
      setShowAuthModal(false)
    } catch (error) {
      // Error handled by store
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    if (errors.phone) {
      setErrors({ ...errors, phone: null });
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors({ ...errors, name: null });
    }
  };

  return (
    <Modal
      isOpen={showAuthModal}
      onClose={() => {
        setShowAuthModal(false);
        setPhone('');
        setName('');
        setIsNewUser(false);
        setErrors({});
      }}
      title={isNewUser ? 'Create Account' : 'Welcome Back'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Phone Input */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="9876543210"
              className={`input-field pl-11 ${errors.phone ? 'border-error-500 focus:ring-error-500' : ''}`}
              disabled={isLoading}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-error-600 mt-1">{errors.phone}</p>
          )}
          <p className="text-xs text-secondary-500 mt-1">
            Enter your 10-digit mobile number
          </p>
        </div>

        {/* Name Input (for new users) */}
        {isNewUser && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Your Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="John Doe"
                className={`input-field pl-11 ${errors.name ? 'border-error-500 focus:ring-error-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-error-600 mt-1">{errors.name}</p>
            )}
          </motion.div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
          loading={isLoading}
        >
          {isLoading ? 'Please wait...' : isNewUser ? 'Create Account' : 'Continue'}
        </Button>

        {/* Toggle between Login/Signup */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsNewUser(!isNewUser);
              setErrors({});
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            disabled={isLoading}
          >
            {isNewUser ? 'Already have an account? Login' : 'New user? Create account'}
          </button>
        </div>

        {/* Info Text */}
        <div className="bg-secondary-50 dark:bg-secondary-800 rounded-lg p-4">
          <p className="text-xs text-secondary-600 dark:text-secondary-400 text-center">
            {isNewUser 
              ? 'By creating an account, you agree to our terms and conditions.'
              : 'Enter your phone number to login or create a new account.'
            }
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default SimpleAuth;