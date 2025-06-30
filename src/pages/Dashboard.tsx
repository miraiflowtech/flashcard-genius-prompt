
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Settings, User, LogOut, AlertCircle, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FlashcardGenerator from '@/components/FlashcardGenerator';
import StudyMode from '@/components/StudyMode';
import SessionHistory from '@/components/SessionHistory';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  additional_info: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const Dashboard = () => {
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showStudyMode, setShowStudyMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkGeminiApiKey();
  }, [user]);

  const checkGeminiApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('gemini_api_key')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setHasGeminiKey(data?.gemini_api_key ? true : false);
    } catch (error) {
      console.error('Error checking API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleFlashcardsGenerated = (generatedFlashcards: Flashcard[]) => {
    console.log('Flashcards generated:', generatedFlashcards);
    setFlashcards(generatedFlashcards);
    setShowGenerator(false);
    setShowStudyMode(true);
  };

  const handleLoadSession = (sessionFlashcards: Flashcard[]) => {
    setFlashcards(sessionFlashcards);
    setShowHistory(false);
    setShowStudyMode(true);
  };

  const handleBackFromStudyMode = () => {
    setShowStudyMode(false);
    setFlashcards([]);
  };

  const handleBackFromGenerator = () => {
    setShowGenerator(false);
  };

  const handleBackFromHistory = () => {
    setShowHistory(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showStudyMode && flashcards.length > 0) {
    return (
      <StudyMode 
        flashcards={flashcards}
        onBack={handleBackFromStudyMode}
      />
    );
  }

  if (showGenerator && hasGeminiKey) {
    return (
      <FlashcardGenerator 
        onBack={handleBackFromGenerator}
        onFlashcardsGenerated={handleFlashcardsGenerated}
      />
    );
  }

  if (showHistory) {
    return (
      <SessionHistory
        onBack={handleBackFromHistory}
        onLoadSession={handleLoadSession}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Smart Flashcard Generator</h1>
                <p className="text-gray-600">Create learning flashcards on any topic with AI</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                Welcome back!
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {!hasGeminiKey ? (
          /* API Key Setup Required */
          <div className="max-w-2xl mx-auto">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                  <div>
                    <CardTitle className="text-orange-900">Setup Required</CardTitle>
                    <CardDescription className="text-orange-700">
                      Configure your Google Gemini API key to start generating flashcards
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-orange-800 mb-4">
                  To use this application, you need to configure your Google Gemini 2.0 Flash API key. 
                  This will be securely stored and used to generate your educational flashcards.
                </p>
                <Button 
                  onClick={() => navigate('/settings')}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Configure API Key
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Main Dashboard */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Learn Anything with Flashcards
              </h2>
              <p className="text-xl text-gray-600">
                Generate educational flashcards on any topic using AI
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-xl border-0">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Generate New Flashcards</CardTitle>
                  <CardDescription>
                    Create educational flashcards on any topic
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    onClick={() => setShowGenerator(true)}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg rounded-xl w-full"
                  >
                    <Brain className="mr-2 h-5 w-5" />
                    Generate Flashcards
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0">
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Session History</CardTitle>
                  <CardDescription>
                    Review your last 10 flashcard sessions
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button 
                    onClick={() => setShowHistory(true)}
                    size="lg"
                    variant="outline"
                    className="px-6 py-3 text-lg rounded-xl w-full"
                  >
                    <History className="mr-2 h-5 w-5" />
                    View History
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
