import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Mail, Phone, Building2, User, Edit3, Trash2, Package, Briefcase, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ContactTable({ contacts, sortField, sortDirection, onSort, onEditContact, onDeleteContact }) {
  const [contactToDelete, setContactToDelete] = useState(null);

  const getSortIcon = (field) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 text-slate-400" />;
    return <ArrowUpDown className={`w-4 h-4 ${sortDirection === 'asc' ? 'text-slate-900' : 'text-slate-900 rotate-180'}`} />;
  };

  const formatPhone = (phone) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleDeleteClick = (contact) => {
    setContactToDelete(contact);
  };

  const confirmDelete = async () => {
    if (contactToDelete) {
      await onDeleteContact(contactToDelete);
      setContactToDelete(null);
    }
  };

  const getContactDisplayName = (contact) => {
    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
    return fullName || 'No name';
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="font-semibold text-slate-700">
                  <Button
                    variant="ghost"
                    onClick={() => onSort('lastName')}
                    className="flex items-center gap-2 hover:bg-slate-100 -ml-3"
                  >
                    <User className="w-4 h-4" />
                    Name
                    {getSortIcon('lastName')}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Title / Function
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <Button
                    variant="ghost"
                    onClick={() => onSort('companyName')}
                    className="flex items-center gap-2 hover:bg-slate-100 -ml-3"
                  >
                    <Building2 className="w-4 h-4" />
                    Company
                    {getSortIcon('companyName')}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Products
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Escalation
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {contacts.map((contact, index) => (
                  <motion.tr
                    key={contact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b border-slate-100 transition-colors hover:bg-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-[#FFFDD0]'
                      }`}
                  >
                    <TableCell className="py-4">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {getContactDisplayName(contact)}
                        </div>
                        {contact.firstName && contact.lastName && (
                          <div className="text-sm text-slate-500">{contact.firstName} {contact.lastName}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        {contact.title && (
                          <div className="text-sm text-slate-700">{contact.title}</div>
                        )}
                        {contact.function && (
                          <div className="text-sm text-slate-500">{contact.function}</div>
                        )}
                        {!contact.title && !contact.function && (
                          <span className="text-slate-400 text-sm">No title/function</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {contact.companyName ? (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {contact.companyName}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-sm">No company</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        {contact.workEmail && (
                          <div className="flex items-center gap-1 text-sm">
                            <Badge className="bg-blue-100 text-blue-800 text-xs">Work</Badge>
                            <a href={`mailto:${contact.workEmail}`} className="text-blue-600 hover:underline">
                              {contact.workEmail}
                            </a>
                          </div>
                        )}
                        {contact.personalEmail && (
                          <div className="flex items-center gap-1 text-sm">
                            <Badge className="bg-green-100 text-green-800 text-xs">Personal</Badge>
                            <a href={`mailto:${contact.personalEmail}`} className="text-blue-600 hover:underline">
                              {contact.personalEmail}
                            </a>
                          </div>
                        )}
                        {!contact.workEmail && !contact.personalEmail && (
                          <span className="text-slate-400 text-sm">No email</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      {contact.phoneNumber ? (
                        <a href={`tel:${contact.phoneNumber}`} className="text-slate-700 hover:text-slate-900">
                          {formatPhone(contact.phoneNumber)}
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">No phone</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      {contact.products ? (
                        <div className="flex flex-wrap gap-1">
                          {contact.products.split(/[;,]+/).map((prod, i) => (
                            <Badge key={i} variant="outline" className="text-xs border-slate-300 text-slate-700">
                              {prod.trim()}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">No products</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      {contact.escalationContact === "Y" ? (
                        <Badge className="bg-red-100 text-red-800">Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditContact(contact)}
                          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(contact)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!contactToDelete} onOpenChange={() => setContactToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {contactToDelete && getContactDisplayName(contactToDelete)}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Contact
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}