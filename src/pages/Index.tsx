
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import ClientDashboard from '@/components/ClientDashboard';
import { User, Building2, Calendar } from 'lucide-react';

const Index = () => {
  const [clientId, setClientId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clientData, setClientData] = useState(null);

  const handleLogin = async () => {
    if (!clientId.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא הזן מזהה לקוח",
        variant: "destructive"
      });
      return;
    }

    // Here we would typically validate the client ID with Airtable
    // For now, we'll simulate a successful login
    setClientData({
      id: clientId,
      name: `לקוח ${clientId}`,
      email: `client${clientId}@example.com`
    });
    setIsLoggedIn(true);
    
    toast({
      title: "התחברות מוצלחת",
      description: `ברוכים הבאים, לקוח ${clientId}`,
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setClientId('');
    setClientData(null);
    toast({
      title: "התנתקות מוצלחת",
      description: "להתראות!",
    });
  };

  if (isLoggedIn && clientData) {
    return <ClientDashboard client={clientData} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              מערכת ניהול פרסומי נכסים
            </CardTitle>
            <p className="text-gray-600">התחברו למערכת עם מזהה הלקוח שלכם</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clientId" className="text-right block">
                מזהה לקוח
              </Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="clientId"
                  type="text"
                  placeholder="הזינו את מזהה הלקוח שלכם"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="pr-10 text-right"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
              size="lg"
            >
              כניסה למערכת
            </Button>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
                <div className="flex flex-col items-center space-y-1">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <span>ניהול נכסים</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <span>תזמון פרסומים</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <User className="w-5 h-5 text-purple-500" />
                  <span>ניהול לקוחות</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
