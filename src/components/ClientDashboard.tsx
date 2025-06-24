
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import PropertyList from './PropertyList';
import PublicationForm from './PublicationForm';
import PublicationHistory from './PublicationHistory';
import FuturePublications from './FuturePublications';
import { Building2, Plus, History, LogOut, User, Clock } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface ClientDashboardProps {
  client: Client;
  onLogout: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ client, onLogout }) => {
  const [properties, setProperties] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, [client.id]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      // Simulate loading data from Airtable
      // In a real implementation, this would fetch from Airtable API
      const mockProperties = [
        {
          id: '1',
          address: 'רחוב הרצל 15, תל אביב',
          type: 'דירה',
          rooms: 3,
          size: 80,
          createdDate: '2024-06-20'
        },
        {
          id: '2',
          address: 'שדרות ירושלים 42, חיפה',
          type: 'וילה',
          rooms: 5,
          size: 150,
          createdDate: '2024-06-15'
        },
        {
          id: '3',
          address: 'רחוב הנביאים 8, ירושלים',
          type: 'דירה',
          rooms: 2,
          size: 60,
          createdDate: '2024-06-22'
        }
      ];

      const mockPublications = [
        {
          id: '1',
          propertyId: '1',
          clientId: client.id,
          date: '2024-06-20',
          timeSlot: 'morning',
          status: 'published'
        },
        {
          id: '2',
          propertyId: '2',
          clientId: client.id,
          date: '2024-06-26',
          timeSlot: 'afternoon',
          status: 'scheduled'
        },
        {
          id: '3',
          propertyId: '3',
          clientId: client.id,
          date: '2024-06-27',
          timeSlot: 'evening',
          status: 'scheduled'
        }
      ];

      setProperties(mockProperties);
      setPublications(mockPublications);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את נתוני הלקוח",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublicationSuccess = (newPublication: any) => {
    setPublications([...publications, newPublication]);
    toast({
      title: "פרסום נוצר בהצלחה",
      description: "הפרסום נשמר במערכת",
    });
  };

  const handleUpdatePublication = (updatedPublication: any) => {
    setPublications(publications.map(pub => 
      pub.id === updatedPublication.id ? updatedPublication : pub
    ));
  };

  const handleDeletePublication = (publicationId: string) => {
    setPublications(publications.filter(pub => pub.id !== publicationId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
                <p className="text-sm text-gray-600">{client.email}</p>
              </div>
            </div>
            <Button 
              onClick={onLogout} 
              variant="outline" 
              className="flex items-center space-x-2 space-x-reverse"
            >
              <LogOut className="w-4 h-4" />
              <span>התנתקות</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="properties" className="flex items-center space-x-2 space-x-reverse">
              <Building2 className="w-4 h-4" />
              <span>הנכסים שלי</span>
            </TabsTrigger>
            <TabsTrigger value="new-publication" className="flex items-center space-x-2 space-x-reverse">
              <Plus className="w-4 h-4" />
              <span>פרסום חדש</span>
            </TabsTrigger>
            <TabsTrigger value="future-publications" className="flex items-center space-x-2 space-x-reverse">
              <Clock className="w-4 h-4" />
              <span>פרסומים עתידיים</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2 space-x-reverse">
              <History className="w-4 h-4" />
              <span>היסטוריה</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <PropertyList 
              properties={properties} 
              publications={publications}
              clientId={client.id}
            />
          </TabsContent>

          <TabsContent value="new-publication">
            <PublicationForm 
              properties={properties}
              publications={publications}
              clientId={client.id}
              onSuccess={handlePublicationSuccess}
            />
          </TabsContent>

          <TabsContent value="future-publications">
            <FuturePublications 
              publications={publications}
              properties={properties}
              onUpdatePublication={handleUpdatePublication}
              onDeletePublication={handleDeletePublication}
            />
          </TabsContent>

          <TabsContent value="history">
            <PublicationHistory 
              publications={publications}
              properties={properties}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;
