
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

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

/**
 * Check if a property is considered new (created less than 3 days ago)
 */
export const isNewProperty = (createdDate: string): boolean => {
  const created = parseISO(createdDate);
  const today = startOfDay(new Date());
  const daysDiff = differenceInDays(today, created);
  return daysDiff < 3;
};

/**
 * Get the last publication date for a specific property
 */
export const getLastPublicationDate = (propertyId: string, publications: Publication[]): string | null => {
  const propertyPublications = publications
    .filter(pub => pub.propertyId === propertyId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return propertyPublications.length > 0 ? propertyPublications[0].date : null;
};

/**
 * Check if a property can be published on a specific date
 */
export const canPublishProperty = (
  propertyId: string, 
  publications: Publication[], 
  targetDate: string,
  createdDate: string
): boolean => {
  // New properties can always be published
  if (isNewProperty(createdDate)) {
    return true;
  }

  const lastPubDate = getLastPublicationDate(propertyId, publications);
  
  if (!lastPubDate) {
    return true; // Never published before
  }

  const lastPub = parseISO(lastPubDate);
  const target = parseISO(targetDate);
  const daysDiff = differenceInDays(target, lastPub);

  return daysDiff >= 3;
};

/**
 * Check if a client can publish on a specific date (max one publication per day per client)
 */
export const canClientPublishToday = (
  clientId: string, 
  publications: Publication[], 
  targetDate: string
): boolean => {
  const clientPublicationsToday = publications.filter(
    pub => pub.clientId === clientId && pub.date === targetDate
  );

  return clientPublicationsToday.length === 0;
};

/**
 * Get available properties for publication on a specific date
 */
export const getAvailableProperties = (
  properties: Property[],
  publications: Publication[],
  clientId: string,
  targetDate: string
): Property[] => {
  // First check if client can publish today
  if (!canClientPublishToday(clientId, publications, targetDate)) {
    return [];
  }

  return properties.filter(property => 
    canPublishProperty(property.id, publications, targetDate, property.createdDate)
  );
};

/**
 * Validate publication rules before submission
 */
export const validatePublication = (
  propertyId: string,
  clientId: string,
  targetDate: string,
  properties: Property[],
  publications: Publication[]
): { isValid: boolean; error?: string } => {
  const property = properties.find(p => p.id === propertyId);
  
  if (!property) {
    return { isValid: false, error: 'נכס לא נמצא' };
  }

  if (!canClientPublishToday(clientId, publications, targetDate)) {
    return { 
      isValid: false, 
      error: 'כבר פרסמתם פרסום אחד היום. ניתן לפרסם פרסום אחד ביום בלבד.' 
    };
  }

  if (!canPublishProperty(propertyId, publications, targetDate, property.createdDate)) {
    if (!isNewProperty(property.createdDate)) {
      return { 
        isValid: false, 
        error: 'הנכס פורסם בתוך 3 הימים האחרונים.' 
      };
    }
  }

  return { isValid: true };
};
