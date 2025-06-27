
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Zap, Target, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
                <p className="text-gray-600">Powered by Google Gemini 2.0 Flash</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Powered by Google Gemini 2.0 Flash
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Study Smarter, Not Harder
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Generate personalized flashcards from any topic using Google's latest AI. 
            Optimized for effective learning with intelligent content generation.
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Start Learning Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Google Gemini 2.0 Flash</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Latest AI technology from Google creates high-quality flashcards following cognitive science principles for optimal learning.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Customizable Difficulty</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Choose your difficulty level and number of cards. The AI adapts content complexity to match your learning needs.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Instant Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Generate comprehensive flashcard sets in seconds. Just enter a topic and let AI create personalized study materials.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Ready to Get Started?</CardTitle>
            <CardDescription className="text-blue-100 text-lg">
              Create your account and start generating flashcards in minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Mathematics</Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">History</Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Science</Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Languages</Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">Programming</Badge>
            </div>
            <Button 
              onClick={() => navigate('/auth')}
              variant="secondary" 
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-semibold"
            >
              Sign Up Free
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LandingPage;
