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
    archiveAndResetPoll,
    rounds,
    weightConfig,
    setWeightConfig,
    hideResults,
    setHideResults,
    verifyAdminPassword,
    changeAdminPassword,
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
      <div className="w-full max-w-7xl mx-auto">
        <PollHeader totalVotes={votes.length} />

        <div className="p-4">
          {activeTab === 'poll' && (
            <div className="max-w-md mx-auto">
              <PollForm onSubmit={addVote} />
            </div>
          )}

          {activeTab === 'admin' && !isLoggedIn && (
            <div className="max-w-md mx-auto">
              <AdminLogin onLogin={handleLogin} />
            </div>
          )}

          {activeTab === 'admin' && isLoggedIn && (
            <div className="w-full">
              <AdminDashboard
                votes={votes}
                rounds={rounds}
                weightConfig={weightConfig}
                hideResults={hideResults}
                results={results}
                onWeightChange={setWeightConfig}
                onHideResultsChange={setHideResults}
                onDeleteVote={deleteVote}
                onToggleExcludeVote={toggleExcludeVote}
                onArchiveAndReset={archiveAndResetPoll}
                onChangePassword={changeAdminPassword}
                onExport={exportData}
                onImport={importData}
                onLogout={handleLogout}
              />
            </div>
          )}
        </div>
      </div>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
