import { cn } from '@/lib/utils';
import { Vote, Settings } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'poll' | 'admin';
  onTabChange: (tab: 'poll' | 'admin') => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="max-w-md mx-auto flex">
        <button
          onClick={() => onTabChange('poll')}
          className={cn(
            'flex-1 flex flex-col items-center gap-1 py-3 transition-colors',
            activeTab === 'poll' 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Vote className="h-5 w-5" />
          <span className="text-xs font-medium">Poll</span>
        </button>
        <button
          onClick={() => onTabChange('admin')}
          className={cn(
            'flex-1 flex flex-col items-center gap-1 py-3 transition-colors',
            activeTab === 'admin' 
              ? 'text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs font-medium">Admin</span>
        </button>
      </div>
    </div>
  );
}
