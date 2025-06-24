
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { CalendarIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  canPublishProperty, 
  canClientPublishToday, 
  isNewProperty,
  getAvailableProperties 
} from '@/utils/publicationUtils';

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

interface PublicationFormProps {
  properties: Property[];
  publications: Publication[];
  clientId: string;
  onSuccess: (publication: Publication) => void;
}

const PublicationForm: React.FC<PublicationFormProps> = ({ 
  properties, 
  publications, 
  clientId, 
  onSuccess 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeSlots = [
    { value: 'morning', label: 'בוקר (08:00-12:00)' },
    { value: 'afternoon', label: 'צהריים (12:00-17:00)' },
    { value: 'evening', label: 'ערב (17:00-22:00)' }
  ];

  const getAvailableDates = () => {
    const dates = [];
    const today = startOfDay(new Date());
    
    for (let i = 1; i <= 7; i++) {
      dates.push(addDays(today, i));
    }
    
    return dates;
  };

  const getSelectableProperties = () => {
    if (!selectedDate) return [];
    
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    return getAvailableProperties(properties, publications, clientId, selectedDateStr);
  };

  const validateForm = () => {
    if (!selectedDate) {
      toast({
        title: "שגיאה",
        description: "אנא בחרו תאריך לפרסום",
        variant: "destructive"
      });
      return false;
    }

    if (!selectedTimeSlot) {
      toast({
        title: "שגיאה",
        description: "אנא בחרו טווח זמן",
        variant: "destructive"
      });
      return false;
    }

    if (!selectedProperty) {
      toast({
        title: "שגיאה",
        description: "אנא בחרו נכס לפרסום",
        variant: "destructive"
      });
      return false;
    }

    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // Check if client can publish today
    if (!canClientPublishToday(clientId, publications, selectedDateStr)) {
      toast({
        title: "לא ניתן לפרסם",
        description: "כבר פרסמתם פרסום אחד היום. ניתן לפרסם פרסום אחד ביום בלבד.",
        variant: "destructive"
      });
      return false;
    }

    // Check if property can be published
    const property = properties.find(p => p.id === selectedProperty);
    if (property && !canPublishProperty(selectedProperty, publications, selectedDateStr, property.createdDate)) {
      if (!isNewProperty(property.createdDate)) {
        toast({
          title: "לא ניתן לפרסם",
          description: "הנכס פורסם בתוך 3 הימים האחרונים.",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call to Airtable
      const newPublication: Publication = {
        id: Date.now().toString(),
        propertyId: selectedProperty,
        clientId: clientId,
        date: format(selectedDate!, 'yyyy-MM-dd'),
        timeSlot: selectedTimeSlot,
        status: 'published'
      };

      // Here you would make the actual API call to Airtable
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSuccess(newPublication);

      // Reset form
      setSelectedDate(undefined);
      setSelectedTimeSlot('');
      setSelectedProperty('');

    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את הפרסום. נסו שוב.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableDates = getAvailableDates();
  const selectableProperties = getSelectableProperties();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">יצירת פרסום חדש</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>תאריך פרסום</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-right font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: he })
                ) : (
                  <span>בחרו תאריך</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  const today = startOfDay(new Date());
                  const maxDate = addDays(today, 7);
                  return date <= today || date > maxDate;
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <p className="text-sm text-gray-500">ניתן לבחור תאריכים עד שבוע קדימה</p>
        </div>

        <div className="space-y-2">
          <Label>טווח זמן</Label>
          <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
            <SelectTrigger className="text-right">
              <SelectValue placeholder="בחרו טווח זמן" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((slot) => (
                <SelectItem key={slot.value} value={slot.value}>
                  {slot.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>נכס לפרסום</Label>
          <Select 
            value={selectedProperty} 
            onValueChange={setSelectedProperty}
            disabled={!selectedDate}
          >
            <SelectTrigger className="text-right">
              <SelectValue placeholder={selectedDate ? "בחרו נכס" : "בחרו תחילה תאריך"} />
            </SelectTrigger>
            <SelectContent>
              {selectableProperties.map((property) => {
                const isNew = isNewProperty(property.createdDate);
                return (
                  <SelectItem key={property.id} value={property.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{property.address}</span>
                      {isNew && (
                        <span className="mr-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          חדש
                        </span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          {selectedDate && selectableProperties.length === 0 && (
            <div className="flex items-center space-x-2 space-x-reverse text-amber-600 bg-amber-50 p-3 rounded">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">
                אין נכסים זמינים לפרסום בתאריך זה. 
                בדקו שלא פרסמתם היום או שהנכסים לא פורסמו ב-3 הימים האחרונים.
              </span>
            </div>
          )}
        </div>

        {selectedDate && selectedTimeSlot && selectedProperty && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">סיכום הפרסום</h4>
            </div>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>תאריך:</strong> {format(selectedDate, "PPP", { locale: he })}</p>
              <p><strong>זמן:</strong> {timeSlots.find(t => t.value === selectedTimeSlot)?.label}</p>
              <p><strong>נכס:</strong> {properties.find(p => p.id === selectedProperty)?.address}</p>
            </div>
          </div>
        )}

        <Button 
          onClick={handleSubmit} 
          disabled={!selectedDate || !selectedTimeSlot || !selectedProperty || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? "שומר פרסום..." : "פרסם נכס"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PublicationForm;
