
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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

interface PublicationEditFormProps {
  publication: Publication;
  properties: Property[];
  onSuccess: (publication: Publication) => void;
  onCancel: () => void;
}

const PublicationEditForm: React.FC<PublicationEditFormProps> = ({
  publication,
  properties,
  onSuccess,
  onCancel
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(publication.date));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(publication.timeSlot);
  const [selectedProperty, setSelectedProperty] = useState(publication.propertyId);
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    { value: 'morning', label: 'בוקר (08:00-12:00)' },
    { value: 'afternoon', label: 'צהריים (12:00-17:00)' },
    { value: 'evening', label: 'ערב (17:00-22:00)' }
  ];

  // Allow editing dates up to a week from today
  const today = startOfDay(new Date());
  const maxDate = addDays(today, 7);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call to update publication
      const updatedPublication: Publication = {
        ...publication,
        date: format(selectedDate, 'yyyy-MM-dd'),
        timeSlot: selectedTimeSlot,
        propertyId: selectedProperty
      };

      // Here you would make the actual API call to Airtable
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSuccess(updatedPublication);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את הפרסום",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedPropertyDetails = properties.find(p => p.id === selectedProperty);

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <div className="space-y-2">
        <Label>נכס</Label>
        <Select value={selectedProperty} onValueChange={setSelectedProperty}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {properties.map((property) => (
              <SelectItem key={property.id} value={property.id}>
                {property.address} - {property.type} ({property.rooms} חדרים)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
              <CalendarIcon className="ml-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP", { locale: he })
              ) : (
                <span>בחר תאריך</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < today || date > maxDate}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>טווח זמן</Label>
        <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
          <SelectTrigger>
            <SelectValue />
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

      <div className="flex space-x-2 space-x-reverse pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'שומר...' : 'שמור שינויים'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          ביטול
        </Button>
      </div>
    </form>
  );
};

export default PublicationEditForm;
