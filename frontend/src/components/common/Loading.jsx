import { Loader2 } from 'lucide-react';

const Loading = ({ text = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-secondary-950/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-lg text-secondary-600 dark:text-secondary-400">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto mb-3" />
        <p className="text-secondary-600 dark:text-secondary-400">{text}</p>
      </div>
    </div>
  );
};

export default Loading;