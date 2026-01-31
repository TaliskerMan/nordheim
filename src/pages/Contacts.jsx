import React, { useState, useEffect } from "react";
import { Contact } from "@/entities/Contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, Download } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import ContactForm from "../components/contacts/ContactForm";
import ContactTable from "../components/contacts/ContactTable";

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [sortField, setSortField] = useState('lastName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      let results = [];
      
      if (!searchTerm.trim()) {
        // No search term - show all contacts
        results = [...contacts];
      } else {
        // Active search - filter contacts to only show matches
        const searchLower = searchTerm.toLowerCase().trim();
        results = contacts.filter(contact => {
          const firstName = (contact.firstName || '').toLowerCase();
          const lastName = (contact.lastName || '').toLowerCase();
          const fullName = `${firstName} ${lastName}`.trim();
          const company = (contact.companyName || '').toLowerCase();
          const workEmail = (contact.workEmail || '').toLowerCase();
          const personalEmail = (contact.personalEmail || '').toLowerCase();
          const phoneNumber = (contact.phoneNumber || '').toLowerCase();

          return firstName.includes(searchLower) ||
                 lastName.includes(searchLower) ||
                 fullName.includes(searchLower) ||
                 company.includes(searchLower) ||
                 workEmail.includes(searchLower) ||
                 personalEmail.includes(searchLower) ||
                 phoneNumber.includes(searchLower);
        });
      }

      // Sort the filtered results
      results.sort((a, b) => {
        let aValue = a[sortField] || '';
        let bValue = b[sortField] || '';
        
        if (sortField === 'lastName' && (!aValue || !bValue)) {
          aValue = a.lastName || a.firstName || '';
          bValue = b.lastName || b.firstName || '';
        }
        
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      });

      setFilteredContacts(results);
      setIsSearching(false);
    }, 300); // Debounce search

    return () => {
      clearTimeout(handler);
    };
  }, [contacts, searchTerm, sortField, sortDirection]);

  const loadContacts = async () => {
    setIsLoading(true);
    const data = await Contact.list();
    setContacts(data);
    setIsLoading(false);
  };

  const handleSubmit = async (contactData) => {
    try {
      if (editingContact) {
        await Contact.update(editingContact.id, contactData);
      } else {
        await Contact.create(contactData);
      }
      setShowForm(false);
      setEditingContact(null);
      await loadContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDelete = async (contact) => {
    try {
      await Contact.delete(contact.id);
      await loadContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = ["firstName", "lastName", "title", "function", "companyName", "workEmail", "personalEmail", "phoneNumber", "products", "escalationContact"];
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n";

    filteredContacts.forEach(contact => {
      const row = headers.map(header => {
        let value = contact[header] || "";
        value = value.toString().replace(/"/g, '""');
        if (value.includes(",")) {
          value = `"${value}"`;
        }
        return value;
      }).join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Nordheim</h1>
            <p className="text-slate-600">Manage your contacts and relationships</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="bg-white border-slate-200 shadow-sm"
              disabled={filteredContacts.length === 0}
            >
              <Download className="w-5 h-5 mr-2" />
              Export CSV
            </Button>
            <Button 
              onClick={() => {
                setShowForm(!showForm);
                setEditingContact(null);
              }}
              className="bg-slate-900 hover:bg-slate-800 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Contact
            </Button>
          </div>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <ContactForm
                contact={editingContact}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingContact(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Stats */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search contacts by name, company, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-slate-400"
                />
              </div>
              {searchTerm && !isSearching && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  className="text-slate-600 border-slate-200"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4 text-slate-600">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-medium">
                  {isSearching 
                    ? 'Searching...'
                    : `${filteredContacts.length} contact${filteredContacts.length !== 1 ? 's' : ''}${searchTerm ? ' found' : ''}`
                  }
                </span>
              </div>
            </div>
          </div>
          {searchTerm && !isSearching && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-sm text-slate-600">
                Showing {filteredContacts.length} result{filteredContacts.length !== 1 ? 's' : ''} for <span className="font-medium">"{searchTerm}"</span>
              </p>
            </div>
          )}
        </div>

        {/* Show searching indicator or results */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading contacts...</p>
          </div>
        ) : isSearching ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <p className="text-slate-600">Searching contacts...</p>
          </div>
        ) : (
          <ContactTable
            contacts={filteredContacts}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onEditContact={handleEdit}
            onDeleteContact={handleDelete}
          />
        )}

        {/* Empty state */}
        {!isLoading && !isSearching && filteredContacts.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchTerm ? 'No matching contacts found' : 'No contacts to display'}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm 
                ? `No contacts match "${searchTerm}". Try a different search term or clear the search.` 
                : 'Get started by adding your first contact.'
              }
            </p>
            {!searchTerm ? (
              <Button 
                onClick={() => {
                  setShowForm(true);
                  setEditingContact(null);
                }}
                className="bg-slate-900 hover:bg-slate-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Contact
              </Button>
            ) : (
              <Button 
                onClick={() => setSearchTerm("")}
                variant="outline"
                className="border-slate-200"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}