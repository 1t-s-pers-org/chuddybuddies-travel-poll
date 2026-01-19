import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { PollHeader } from '@/components/poll/PollHeader';
import { PollForm } from '@/components/poll/PollForm';
import { TabNavigation } from '@/components/poll/TabNavigation';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useVotes } from '@/hooks/useVotes';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'poll' | 'admin'>('poll');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isLoggedIn = !!session;

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
    calculateResults,
    exportData,
    importData,
    updateAdminPassword,
  } = useVotes();

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
              <AdminLogin />
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
                onChangePassword={updateAdminPassword}
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
