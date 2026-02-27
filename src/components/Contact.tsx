import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Loader2, Paperclip, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "audio/mpeg", "audio/wav", "audio/mp3", "audio/x-wav", "audio/aac", "audio/flac", "audio/ogg", "image/jpeg", "image/png", "image/gif", "application/zip", "application/x-zip-compressed"];

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

const Contact = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightPhone, setHighlightPhone] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", service: "", message: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const handleHighlight = () => {
      setHighlightPhone(true);
      setTimeout(() => setHighlightPhone(false), 1500);
    };
    window.addEventListener('highlight-phone', handleHighlight);
    return () => window.removeEventListener('highlight-phone', handleHighlight);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: t('contact.form.fileTooLarge'), description: t('contact.form.fileTooLargeDesc'), variant: "destructive" });
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: t('contact.form.fileTypeError'), description: t('contact.form.fileTypeErrorDesc'), variant: "destructive" });
      return;
    }
    setAttachment(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast({ title: t('contact.form.error'), description: t('contact.form.errorFields'), variant: "destructive" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({ title: t('contact.form.error'), description: t('contact.form.errorEmail'), variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      let attachmentData: string | null = null;
      let attachmentName: string | null = null;
      let attachmentType: string | null = null;
      if (attachment) {
        attachmentData = await fileToBase64(attachment);
        attachmentName = attachment.name;
        attachmentType = attachment.type;
      }
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: { ...formData, attachmentData, attachmentName, attachmentType }
      });
      if (error) throw error;
      toast({ title: t('contact.form.success'), description: t('contact.form.successDesc') });
      setFormData({ firstName: "", lastName: "", email: "", phone: "", service: "", message: "" });
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      console.error("Error sending contact email:", error);
      toast({ title: t('contact.form.error'), description: t('contact.form.errorSend'), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            {t('contact.title')} <span className="hero-text">{t('contact.titleHighlight')}</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-2">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          <Card className="service-card">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <MessageSquare className="w-6 h-6 mr-3 text-primary" />
                {t('contact.form.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">{t('contact.form.firstName')} *</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder={t('contact.form.firstName')} className="mt-2" required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t('contact.form.lastName')} *</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder={t('contact.form.lastName')} className="mt-2" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">{t('contact.form.email')} *</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="votre.email@exemple.com" className="mt-2" required />
                </div>
                <div>
                  <Label htmlFor="phone">{t('contact.form.phone')}</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+33 1 23 45 67 89" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="service">{t('contact.form.service')}</Label>
                  <select id="service" name="service" value={formData.service} onChange={handleInputChange} className="w-full mt-2 px-3 py-2 bg-input border border-border rounded-md text-foreground">
                    <option value="">{t('contact.form.selectService')}</option>
                    <option value="mixage-mastering">{t('services.data.mixage-mastering.title')} (Premium)</option>
                    <option value="mixage-mastering-essentiel">{t('services.data.mixage-mastering-express.title')}</option>
                    <option value="stem-mastering">{t('services.data.stem-mastering.title')}</option>
                    <option value="mixage-hybride">{t('services.data.mixage-hybride.title')}</option>
                    <option value="captation-sonore">{t('services.data.captation-sonore.title')}</option>
                    <option value="sound-design">{t('services.data.sound-design.title')}</option>
                    <option value="composition-beatmaking">{t('services.data.composition.title')}</option>
                    <option value="direction-artistique">{t('services.data.direction-artistique.title')}</option>
                    <option value="formation">{t('services.data.formation.title')}</option>
                    <option value="pack-single">{t('services.data.pack-single.title')}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="message">{t('contact.form.message')} *</Label>
                  <Textarea id="message" name="message" value={formData.message} onChange={handleInputChange} placeholder={t('contact.form.messagePlaceholder')} className="mt-2 min-h-[120px]" required />
                </div>
                <div>
                  <Label htmlFor="attachment">{t('contact.form.attachment')}</Label>
                  <div className="mt-2">
                    {attachment ? (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                        <Paperclip className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm truncate flex-1">{attachment.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">({(attachment.size / 1024 / 1024).toFixed(2)} Mo)</span>
                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0" onClick={removeAttachment}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="relative">
                        <input ref={fileInputRef} type="file" id="attachment" onChange={handleFileChange} accept=".pdf,.mp3,.wav,.flac,.aac,.ogg,.jpg,.jpeg,.png,.gif,.zip" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="flex items-center gap-2 p-3 border border-dashed border-border rounded-md hover:border-primary/50 transition-colors cursor-pointer">
                          <Paperclip className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{t('contact.form.attachmentFormats')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full studio-button" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('contact.form.sending')}</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" />{t('contact.form.send')}</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="service-card">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Phone className="w-6 h-6 mr-3 text-primary" />
                  {t('contact.info.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{t('contact.info.address')}</div>
                    <div className="text-muted-foreground">8 allée des ajoncs<br />13500 Martigues, France</div>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${highlightPhone ? 'highlight-phone bg-primary/30' : ''}`}>
                    <Phone className={`w-5 h-5 transition-colors duration-300 ${highlightPhone ? 'text-primary' : 'text-secondary'}`} />
                  </div>
                  <div className={`transition-all duration-300 ${highlightPhone ? 'text-primary' : ''}`}>
                    <div className="font-medium">{t('contact.info.phone')}</div>
                    <div className={`transition-colors duration-300 ${highlightPhone ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>+33 6 59 79 73 42</div>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{t('contact.info.email')}</div>
                    <div className="text-muted-foreground">globaldripstudio@gmail.com</div>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="font-medium">{t('contact.info.hours')}</div>
                    <div className="text-muted-foreground">{t('contact.info.hoursValue')}<br />{t('contact.info.hoursClosed')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-card to-muted/20 border-border/50">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <img src="/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png" alt="Global Drip Studio" className="h-16 object-contain opacity-80" />
                </div>
                <h3 className="font-bold text-lg mb-2">Global Drip Studio</h3>
                <p className="text-muted-foreground">{t('contact.tagline')}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
