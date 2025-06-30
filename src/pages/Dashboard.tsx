
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Settings, User, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FlashcardGenerator from '@/components/FlashcardGenerator';
import StudyMode from '@/components/StudyMode';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  category: string;
}

const Dashboard = () => {
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [showStudyMode, setShowStudyMode] = useState(false);
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

  const handleBackFromStudyMode = () => {
    setShowStudyMode(false);
    setFlashcards([]);
  };

  const handleBackFromGenerator = () => {
    setShowGenerator(false);
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
                <h1 className="text-2xl font-bold text-gray-900">AI Flashcard Generator</h1>
                <p className="text-gray-600">Create intelligent study materials with Google Gemini</p>
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
                  This will be securely stored and used to generate your flashcards.
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
                Generate Your Flashcards
              </h2>
              <p className="text-xl text-gray-600">
                Enter any topic and let Google Gemini 2.0 Flash create personalized study materials
              </p>
            </div>

            <Card className="shadow-xl border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Ready to Start Learning?</CardTitle>
                <CardDescription className="text-lg">
                  Click below to access the flashcard generator
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  onClick={() => setShowGenerator(true)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl"
                >
                  <Brain className="mr-2 h-5 w-5" />
                  Generate Flashcards
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
