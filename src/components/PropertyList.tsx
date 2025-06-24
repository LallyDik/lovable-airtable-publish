
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Ruler, Home, Calendar } from 'lucide-react';
import { isNewProperty, getLastPublicationDate } from '@/utils/publicationUtils';

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

interface PropertyListProps {
  properties: Property[];
  publications: Publication[];
  clientId: string;
}

const PropertyList: React.FC<PropertyListProps> = ({ properties, publications, clientId }) => {
  const getPropertyPublications = (propertyId: string) => {
    return publications.filter(pub => pub.propertyId === propertyId);
  };

  const getPropertyStatus = (property: Property) => {
    const isNew = isNewProperty(property.createdDate);
    const lastPubDate = getLastPublicationDate(property.id, publications);
    
    if (isNew) {
      return { label: 'נכס חדש', color: 'bg-green-100 text-green-800' };
    } else if (lastPubDate) {
      const daysSinceLastPub = Math.floor((new Date().getTime() - new Date(lastPubDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastPub < 3) {
        return { label: `פורסם לפני ${daysSinceLastPub} ימים`, color: 'bg-red-100 text-red-800' };
      } else {
        return { label: 'זמין לפרסום', color: 'bg-blue-100 text-blue-800' };
      }
    } else {
      return { label: 'לא פורסם', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">אין נכסים במערכת</h3>
          <p className="text-gray-600">צרו קשר עם המנהל להוספת נכסים חדשים</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">הנכסים שלי</h2>
        <Badge variant="outline" className="text-sm">
          {properties.length} נכסים
        </Badge>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => {
          const propertyPubs = getPropertyPublications(property.id);
          const status = getPropertyStatus(property);
          
          return (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex items-center space-x-2 space-x-reverse">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>{property.type}</span>
                  </CardTitle>
                  <Badge className={status.color}>
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2 space-x-reverse">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{property.address}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <Home className="w-4 h-4" />
                    <span>{property.rooms} חדרים</span>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <Ruler className="w-4 h-4" />
                    <span>{property.size} מ"ר</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>נוצר: {new Date(property.createdDate).toLocaleDateString('he-IL')}</span>
                    <span>פרסומים: {propertyPubs.length}</span>
                  </div>
                </div>

                {propertyPubs.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">פרסומים אחרונים:</h4>
                    <div className="space-y-1">
                      {propertyPubs.slice(-3).map((pub) => (
                        <div key={pub.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                          <span>{new Date(pub.date).toLocaleDateString('he-IL')}</span>
                          <Badge variant="outline" className="text-xs">
                            {pub.timeSlot === 'morning' ? 'בוקר' : 
                             pub.timeSlot === 'afternoon' ? 'צהריים' : 'ערב'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyList;
