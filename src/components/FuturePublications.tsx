
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Building2, Edit, Trash2 } from 'lucide-react';
import { format, isAfter, startOfDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import PublicationEditForm from './PublicationEditForm';

interface Property {
  id: string;
  address: string;
  type: string;
  rooms: number;
  size: number;
  createdDate: string;
}

interface Publication {
  id: string;
  propertyId: string;
  clientId: string;
  date: string;
  timeSlot: string;
  status: string;
}

interface FuturePublicationsProps {
  publications: Publication[];
  properties: Property[];
  onUpdatePublication: (publication: Publication) => void;
  onDeletePublication: (publicationId: string) => void;
}

const FuturePublications: React.FC<FuturePublicationsProps> = ({ 
  publications, 
  properties, 
  onUpdatePublication, 
  onDeletePublication 
}) => {
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getTimeSlotLabel = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return 'בוקר (08:00-12:00)';
      case 'afternoon': return 'צהריים (12:00-17:00)';
      case 'evening': return 'ערב (17:00-22:00)';
      default: return timeSlot;
    }
  };

  const getPropertyDetails = (propertyId: string) => {
    return properties.find(p => p.id === propertyId);
  };

  // Filter future publications only
  const futurePublications = publications.filter(pub => {
    const pubDate = new Date(pub.date);
    const today = startOfDay(new Date());
    return isAfter(pubDate, today) || pub.date === format(today, 'yyyy-MM-dd');
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleEdit = (publication: Publication) => {
    setSelectedPublication(publication);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = (updatedPublication: Publication) => {
    onUpdatePublication(updatedPublication);
    setIsEditDialogOpen(false);
    setSelectedPublication(null);
    toast({
      title: "פרסום עודכן בהצלחה",
      description: "השינויים נשמרו במערכת",
    });
  };

  const handleDelete = (publicationId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הפרסום?')) {
      onDeletePublication(publicationId);
      toast({
        title: "פרסום נמחק",
        description: "הפרסום הוסר מהמערכת",
      });
    }
  };

  if (futurePublications.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין פרסומים עתידיים</h3>
          <p className="text-gray-600">פרסומים שתתזמנו יופיעו כאן</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">פרסומים עתידיים</h2>
        <Badge variant="outline" className="text-sm">
          {futurePublications.length} פרסומים מתוכננים
        </Badge>
      </div>

      <div className="space-y-4">
        {futurePublications.map((publication) => {
          const property = getPropertyDetails(publication.propertyId);
          const publicationDate = new Date(publication.date);
          const isToday = publication.date === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <Card key={publication.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 space-x-reverse mb-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {property ? property.address : 'נכס לא נמצא'}
                      </h3>
                      <Badge className={isToday ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"}>
                        {isToday ? 'היום' : 'מתוכנן'}
                      </Badge>
                    </div>
                    
                    {property && (
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600 mb-3">
                        <span>{property.type}</span>
                        <span>•</span>
                        <span>{property.rooms} חדרים</span>
                        <span>•</span>
                        <span>{property.size} מ"ר</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-6 space-x-reverse text-sm text-gray-600">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Calendar className="w-4 h-4" />
                        <span>{format(publicationDate, "PPP", { locale: he })}</span>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Clock className="w-4 h-4" />
                        <span>{getTimeSlotLabel(publication.timeSlot)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 space-x-reverse">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(publication)}
                          className="flex items-center space-x-1 space-x-reverse"
                        >
                          <Edit className="w-4 h-4" />
                          <span>עריכה</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>עריכת פרסום</DialogTitle>
                        </DialogHeader>
                        {selectedPublication && (
                          <PublicationEditForm
                            publication={selectedPublication}
                            properties={properties}
                            onSuccess={handleEditSuccess}
                            onCancel={() => {
                              setIsEditDialogOpen(false);
                              setSelectedPublication(null);
                            }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(publication.id)}
                      className="flex items-center space-x-1 space-x-reverse text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>מחק</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FuturePublications;
