import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Loader2, Paperclip, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["application/pdf", "audio/mpeg", "audio/wav", "audio/mp3", "audio/x-wav", "audio/aac", "audio/flac", "audio/ogg", "image/jpeg", "image/png", "image/gif", "application/zip", "application/x-zip-compressed"];

// Convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};
const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightPhone, setHighlightPhone] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });
  const {
    toast
  } = useToast();

  // Listen for custom event to highlight phone
  useEffect(() => {
    const handleHighlight = () => {
      setHighlightPhone(true);
      setTimeout(() => setHighlightPhone(false), 1500);
    };
    window.addEventListener('highlight-phone', handleHighlight);
    return () => window.removeEventListener('highlight-phone', handleHighlight);
  }, []);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 10 Mo.",
        variant: "destructive"
      });
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Type de fichier non supporté",
        description: "Formats acceptés : PDF, audio (MP3, WAV, FLAC...), images (JPG, PNG), ZIP.",
        variant: "destructive"
      });
      return;
    }
    setAttachment(file);
  };
  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse email valide.",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Prepare attachment data (send to server for secure upload)
      let attachmentData: string | null = null;
      let attachmentName: string | null = null;
      let attachmentType: string | null = null;
      if (attachment) {
        attachmentData = await fileToBase64(attachment);
        attachmentName = attachment.name;
        attachmentType = attachment.type;
      }

      // Send everything to the edge function (file upload happens server-side with rate limiting)
      const {
        data,
        error
      } = await supabase.functions.invoke('send-contact-email', {
        body: {
          ...formData,
          attachmentData,
          attachmentName,
          attachmentType
        }
      });
      if (error) throw error;
      toast({
        title: "Message envoyé !",
        description: "Nous avons bien reçu votre demande et vous répondrons dans les plus brefs délais."
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        service: "",
        message: ""
      });
      setAttachment(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Error sending contact email:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi. Veuillez réessayer ou nous contacter directement.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <section id="contact" className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Contactez <span className="hero-text">Global Drip</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            Prêt à donner vie à votre projet musical ? Réservez votre session studio 
            ou demandez un devis personnalisé
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          {/* Contact Form */}
          <Card className="service-card">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <MessageSquare className="w-6 h-6 mr-3 text-primary" />
                Demande de réservation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Votre prénom" className="mt-2" required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Votre nom" className="mt-2" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="votre.email@exemple.com" className="mt-2" required />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+33 1 23 45 67 89" className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="service">Service souhaité</Label>
                  <select id="service" name="service" value={formData.service} onChange={handleInputChange} className="w-full mt-2 px-3 py-2 bg-input border border-border rounded-md text-foreground">
                    <option value="">Sélectionnez un service</option>
                    <option value="mixage">Mixage</option>
                    <option value="mixage-mastering">Mixage + Mastering</option>
                    <option value="mixage-mastering-express">Mixage + Mastering Express</option>
                    <option value="sound-design">Sound Design</option>
                    <option value="enregistrement-studio">Enregistrement Studio</option>
                    <option value="enregistrement-terrain">Enregistrement Terrain</option>
                    <option value="composition-beatmaking">Composition/Beatmaking</option>
                    <option value="direction-artistique">Direction Artistique/Arrangement</option>
                    <option value="formation">Formation MAO/Mixage</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea id="message" name="message" value={formData.message} onChange={handleInputChange} placeholder="Décrivez votre projet musical..." className="mt-2 min-h-[120px]" required />
                </div>

                {/* File Attachment */}
                <div>
                  <Label htmlFor="attachment">Pièce jointe (optionnel)</Label>
                  <div className="mt-2">
                    {attachment ? <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                        <Paperclip className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm truncate flex-1">{attachment.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({(attachment.size / 1024 / 1024).toFixed(2)} Mo)
                        </span>
                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0" onClick={removeAttachment}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div> : <div className="relative">
                        <input ref={fileInputRef} type="file" id="attachment" onChange={handleFileChange} accept=".pdf,.mp3,.wav,.flac,.aac,.ogg,.jpg,.jpeg,.png,.gif,.zip" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="flex items-center gap-2 p-3 border border-dashed border-border rounded-md hover:border-primary/50 transition-colors cursor-pointer">
                          <Paperclip className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            PDF, audio, images, ZIP (max 10 Mo)
                          </span>
                        </div>
                      </div>}
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full studio-button" disabled={isSubmitting}>
                  {isSubmitting ? <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </> : <>
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer la demande
                    </>}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <Card className="service-card">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Phone className="w-6 h-6 mr-3 text-primary" />
                  Informations de contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Adresse du studio</div>
                    <div className="text-muted-foreground">
                      8 allée des ajoncs<br />
                      13500 Martigues, France
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${highlightPhone ? 'highlight-phone bg-primary/30' : ''}`}>
                    <Phone className={`w-5 h-5 transition-colors duration-300 ${highlightPhone ? 'text-primary' : 'text-secondary'}`} />
                  </div>
                  <div className={`transition-all duration-300 ${highlightPhone ? 'text-primary' : ''}`}>
                    <div className="font-medium">Téléphone</div>
                    <div className={`transition-colors duration-300 ${highlightPhone ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>+33 6 59 79 73 42</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-muted-foreground">globaldripstudio@gmail.com</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="font-medium">Heures d'ouverture</div>
                    <div className="text-muted-foreground">Lun - Ven : 10h00 - 19h00<br />
                      Sam - Dim : Fermé
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>


            {/* Logo Display */}
            <Card className="p-8 bg-gradient-to-br from-card to-muted/20 border-border/50">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <img src="/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png" alt="Global Drip Studio - Professional Audio" className="h-16 object-contain opacity-80" />
                </div>
                <h3 className="font-bold text-lg mb-2">Global Drip Studio</h3>
                <p className="text-muted-foreground">
                  Passion audio & Innovation constante
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>;
};
export default Contact;