import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Building2, Mail, Phone, Save, X, Package, Briefcase } from "lucide-react";

export default function ContactForm({ contact, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    title: "",
    function: "",
    companyName: "",
    workEmail: "",
    personalEmail: "",
    phoneNumber: "",
    products: "",
    escalationContact: "N"
  });

  useEffect(() => {
    // When the contact prop changes (i.e., when editing), update the form data
    if (contact) {
      setFormData({
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        title: contact.title || "",
        function: contact.function || "",
        companyName: contact.companyName || "",
        workEmail: contact.workEmail || "",
        personalEmail: contact.personalEmail || "",
        phoneNumber: contact.phoneNumber || "",
        products: contact.products || "",
        escalationContact: contact.escalationContact || "N"
      });
    } else {
      // If no contact is provided (i.e., creating new), reset the form
      setFormData({
        firstName: "",
        lastName: "",
        title: "",
        function: "",
        companyName: "",
        workEmail: "",
        personalEmail: "",
        phoneNumber: "",
        products: "",
        escalationContact: "N"
      });
    }
  }, [contact]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Remove empty strings and convert to undefined for proper null handling
    const cleanedData = Object.keys(formData).reduce((acc, key) => {
      const value = formData[key]?.trim();
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    onSubmit(cleanedData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-xl border-0 bg-white">
      <CardHeader className="bg-slate-50 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <User className="w-5 h-5" />
          {contact ? 'Edit Contact' : 'Add New Contact'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-slate-700 font-medium">First Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  className="pl-10 border-slate-200 focus:border-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-slate-700 font-medium">Last Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  className="pl-10 border-slate-200 focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700 font-medium">Title</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter job title"
                  className="pl-10 border-slate-200 focus:border-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="function" className="text-slate-700 font-medium">Function</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="function"
                  value={formData.function}
                  onChange={(e) => handleInputChange('function', e.target.value)}
                  placeholder="Enter function/role"
                  className="pl-10 border-slate-200 focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-slate-700 font-medium">Company Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter company name"
                className="pl-10 border-slate-200 focus:border-slate-400"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="workEmail" className="text-slate-700 font-medium">Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="workEmail"
                  type="email"
                  value={formData.workEmail}
                  onChange={(e) => handleInputChange('workEmail', e.target.value)}
                  placeholder="work@company.com"
                  className="pl-10 border-slate-200 focus:border-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalEmail" className="text-slate-700 font-medium">Personal Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="personalEmail"
                  type="email"
                  value={formData.personalEmail}
                  onChange={(e) => handleInputChange('personalEmail', e.target.value)}
                  placeholder="personal@email.com"
                  className="pl-10 border-slate-200 focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-slate-700 font-medium">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="(555) 123-4567"
                className="pl-10 border-slate-200 focus:border-slate-400"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="products" className="text-slate-700 font-medium">Products</Label>
              <div className="relative">
                <Package className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="products"
                  value={formData.products}
                  onChange={(e) => handleInputChange('products', e.target.value)}
                  placeholder="Enter products"
                  className="pl-10 border-slate-200 focus:border-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="escalationContact" className="text-slate-700 font-medium">Escalation Contact</Label>
              <Select
                value={formData.escalationContact}
                onValueChange={(value) => handleInputChange('escalationContact', value)}
              >
                <SelectTrigger className="border-slate-200 focus:border-slate-400">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">Yes</SelectItem>
                  <SelectItem value="N">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800"
            >
              <Save className="w-4 h-4" />
              {contact ? 'Update Contact' : 'Save Contact'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}