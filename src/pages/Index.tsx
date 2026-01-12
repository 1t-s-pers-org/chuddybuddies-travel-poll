import { useState } from 'react';
import { PollHeader } from '@/components/poll/PollHeader';
import { PollForm } from '@/components/poll/PollForm';
import { TabNavigation } from '@/components/poll/TabNavigation';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useVotes } from '@/hooks/useVotes';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'poll' | 'admin'>('poll');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const {
    votes,
    addVote,
    deleteVote,
    toggleExcludeVote,
    weightConfig,
    setWeightConfig,
    hideResults,
    setHideResults,
    verifyAdminPassword,
    calculateResults,
    exportData,
    importData,
  } = useVotes();

  const handleLogin = (password: string): boolean => {
    const success = verifyAdminPassword(password);
    if (success) {
      setIsLoggedIn(true);
    }
    return success;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const results = calculateResults();

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-md mx-auto">
        <PollHeader totalVotes={votes.length} />

        <div className="p-4">
          {activeTab === 'poll' && (
            <PollForm onSubmit={addVote} />
          )}

          {activeTab === 'admin' && !isLoggedIn && (
            <AdminLogin onLogin={handleLogin} />
          )}

          {activeTab === 'admin' && isLoggedIn && (
            <AdminDashboard
              votes={votes}
              weightConfig={weightConfig}
              hideResults={hideResults}
              results={results}
              onWeightChange={setWeightConfig}
              onHideResultsChange={setHideResults}
              onDeleteVote={deleteVote}
              onToggleExcludeVote={toggleExcludeVote}
              onExport={exportData}
              onImport={importData}
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
