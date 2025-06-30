
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  additional_info: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface FlashcardGeneratorProps {
  onBack: () => void;
  onFlashcardsGenerated: (flashcards: Flashcard[]) => void;
}

const FlashcardGenerator: React.FC<FlashcardGeneratorProps> = ({ onBack, onFlashcardsGenerated }) => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState('10');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchGeminiApiKey();
  }, [user]);

  const fetchGeminiApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('gemini_api_key')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setGeminiApiKey(data.gemini_api_key || '');
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  };

  const saveFlashcardSession = async (flashcards: Flashcard[], sessionTopic: string) => {
    try {
      // Create session record
      const { data: sessionData, error: sessionError } = await supabase
        .from('flashcard_sessions')
        .insert({
          user_id: user?.id,
          topic: sessionTopic,
          difficulty: difficulty,
          flashcard_count: flashcards.length
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Save individual flashcards
      const flashcardInserts = flashcards.map(card => ({
        session_id: sessionData.id,
        german_word: card.front,
        english_meaning: card.back,
        example_sentence: card.additional_info,
        difficulty: card.difficulty
      }));

      const { error: flashcardsError } = await supabase
        .from('session_flashcards')
        .insert(flashcardInserts);

      if (flashcardsError) throw flashcardsError;

      console.log('Session saved successfully:', sessionData.id);
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save session, but flashcards are still available for study');
    }
  };

  const generateFlashcards = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic to generate flashcards for.');
      return;
    }

    if (!geminiApiKey) {
      toast.error('Gemini API key not found. Please configure it in settings.');
      return;
    }

    setIsGenerating(true);

    try {
      const systemPrompt = `You are an educational content creator that creates flashcards for learning any topic. Generate flashcards with clear front/back content and additional information to help with learning.

CORE PRINCIPLES:
- Create clear, concise flashcards appropriate for the topic
- Front should contain the question/term/concept
- Back should contain the answer/definition/explanation
- Additional info should provide context, examples, or helpful details
- Ensure difficulty level matches the request
- Focus on the most important and useful information for the topic

OUTPUT FORMAT:
Always respond with valid JSON in this exact structure:
{
  "flashcards": [
    {
      "id": "unique_id",
      "front": "question/term/concept",
      "back": "answer/definition/explanation",
      "additional_info": "context, examples, or helpful details",
      "difficulty": "easy|medium|hard"
    }
  ]
}`;

      const userPrompt = `Generate ${count} flashcards about ${topic}.

Requirements:
- Topic: ${topic}
- Difficulty Level: ${difficulty}
- Create educational flashcards suitable for learning
- Include clear front/back content and helpful additional information

Focus on the most important concepts and information related to ${topic}.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\n${userPrompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
            responseMimeType: "application/json"
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.candidates[0].content.parts[0].text;
      
      console.log('Raw API response:', content);
      
      let parsedData;
      try {
        parsedData = JSON.parse(content);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error('Could not parse API response as JSON');
      }

      if (parsedData.flashcards && Array.isArray(parsedData.flashcards)) {
        console.log('Generated flashcards:', parsedData.flashcards);
        
        // Save session to database
        await saveFlashcardSession(parsedData.flashcards, topic);
        
        onFlashcardsGenerated(parsedData.flashcards);
        toast.success(`Successfully created ${parsedData.flashcards.length} flashcards for ${topic}!`);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Generate Flashcards</h1>
          <p className="text-gray-600">Powered by Google Gemini 2.0 Flash</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Flashcard Generator
              </CardTitle>
              <CardDescription>
                Generate educational flashcards on any topic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic Input */}
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-sm font-medium">
                  Topic *
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g., Math formulas, History facts, Science concepts, German vocabulary"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="count" className="text-sm font-medium">
                    Number of Cards
                  </Label>
                  <Select value={count} onValueChange={setCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 cards</SelectItem>
                      <SelectItem value="10">10 cards</SelectItem>
                      <SelectItem value="15">15 cards</SelectItem>
                      <SelectItem value="20">20 cards</SelectItem>
                      <SelectItem value="25">25 cards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm font-medium">
                    Difficulty Level
                  </Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateFlashcards}
                disabled={isGenerating || !topic.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg rounded-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Flashcards...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Flashcards
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlashcardGenerator;
