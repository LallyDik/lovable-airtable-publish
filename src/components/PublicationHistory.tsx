
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Building2 } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { he } from 'date-fns/locale';

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

interface PublicationHistoryProps {
  publications: Publication[];
  properties: Property[];
}

const PublicationHistory: React.FC<PublicationHistoryProps> = ({ publications, properties }) => {
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

  // Filter to show only past publications (where the date has already passed)
  const today = startOfDay(new Date());
  const pastPublications = publications.filter(publication => {
    const pubDate = startOfDay(new Date(publication.date));
    return pubDate < today;
  });

  const sortedPublications = [...pastPublications].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (pastPublications.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין פרסומים שעברו עדיין</h3>
          <p className="text-gray-600">פרסומים שכבר התרחשו יופיעו כאן</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">היסטוריית פרסומים</h2>
        <Badge variant="outline" className="text-sm">
          {pastPublications.length} פרסומים
        </Badge>
      </div>

      <div className="space-y-4">
        {sortedPublications.map((publication) => {
          const property = getPropertyDetails(publication.propertyId);
          const publicationDate = new Date(publication.date);
          
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
                      <Badge className="bg-green-100 text-green-800">
                        פורסם
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

                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">
                      פורסם ב-{format(publicationDate, "dd/MM/yyyy")}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      מזהה: {publication.id}
                    </Badge>
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

export default PublicationHistory;
