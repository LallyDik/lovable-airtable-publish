
// Mock Airtable API functions for development
// Replace with actual Airtable API calls when ready

import { differenceInDays, parseISO } from 'date-fns';

// Types
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

interface Client {
  id: string;
  name: string;
  email: string;
}

// Mock data storage (replace with actual Airtable API)
let mockPublications: Publication[] = [
  {
    id: '1',
    propertyId: '1',
    clientId: 'client-1',
    date: '2025-06-20',
    timeSlot: 'morning',
    status: 'published'
  },
  {
    id: '2',
    propertyId: '2',
    clientId: 'client-1',
    date: '2025-06-21',
    timeSlot: 'afternoon',
    status: 'published'
  },
  {
    id: '3',
    propertyId: '3',
    clientId: 'client-1',
    date: '2025-06-26',
    timeSlot: 'evening',
    status: 'scheduled'
  }
];

// API Functions

export const fetchProperties = async (clientId: string): Promise<Property[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock properties data
  return [
    {
      id: '1',
      address: 'רחוב הרצל 15, תל אביב',
      type: 'דירה',
      rooms: 3,
      size: 80,
      createdDate: '2025-06-15'
    },
    {
      id: '2',
      address: 'שדרות בן גוריון 42, חיפה',
      type: 'בית',
      rooms: 4,
      size: 120,
      createdDate: '2025-06-18'
    },
    {
      id: '3',
      address: 'רחוב יפו 123, ירושלים',
      type: 'דירת גן',
      rooms: 5,
      size: 150,
      createdDate: '2025-06-23'
    }
  ];
};

export const fetchPublications = async (clientId: string): Promise<Publication[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockPublications.filter(pub => pub.clientId === clientId);
};

export const savePublication = async (publication: Publication): Promise<Publication> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  console.log('Saving publication to Airtable:', publication);
  
  // Add to mock storage
  mockPublications.push(publication);
  
  return publication;
};

export const updatePublication = async (publication: Publication): Promise<Publication> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  console.log('Updating publication in Airtable:', publication);
  
  // Update in mock storage
  const index = mockPublications.findIndex(pub => pub.id === publication.id);
  if (index !== -1) {
    mockPublications[index] = publication;
  }
  
  return publication;
};

export const deletePublication = async (publicationId: string): Promise<void> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('Deleting publication from Airtable:', publicationId);
  
  // Remove from mock storage
  mockPublications = mockPublications.filter(pub => pub.id !== publicationId);
};

export const fetchClientData = async (clientId: string): Promise<Client> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    id: clientId,
    name: 'לקוח דוגמה',
    email: 'client@example.com'
  };
};

// Helper function to validate publication rules
export const validatePublicationRules = async (
  propertyId: string,
  clientId: string,
  targetDate: string,
  properties: Property[]
): Promise<{ isValid: boolean; error?: string }> => {
  const publications = await fetchPublications(clientId);
  const property = properties.find(p => p.id === propertyId);
  
  if (!property) {
    return { isValid: false, error: 'נכס לא נמצא' };
  }

  // Check if client already published today
  const clientPublicationsToday = publications.filter(
    pub => pub.date === targetDate
  );

  if (clientPublicationsToday.length > 0) {
    return { 
      isValid: false, 
      error: 'כבר פרסמתם פרסום אחד היום. ניתן לפרסם פרסום אחד ביום בלבד.' 
    };
  }

  // Check if property published in last 3 days (unless it's new)
  const propertyCreated = parseISO(property.createdDate);
  const today = new Date();
  const isNewProperty = differenceInDays(today, propertyCreated) < 3;

  if (!isNewProperty) {
    const propertyPublications = publications
      .filter(pub => pub.propertyId === propertyId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (propertyPublications.length > 0) {
      const lastPubDate = parseISO(propertyPublications[0].date);
      const targetDateParsed = parseISO(targetDate);
      const daysDiff = differenceInDays(targetDateParsed, lastPubDate);

      if (daysDiff < 3) {
        return { 
          isValid: false, 
          error: 'הנכס פורסם בתוך 3 הימים האחרונים.' 
        };
      }
    }
  }

  return { isValid: true };
};
