import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  Calendar,
  MessageSquare,
  Users
} from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Contactez <span className="hero-text">Global Drip</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Prêt à donner vie à votre projet musical ? Réservez votre session studio 
            ou demandez un devis personnalisé
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="service-card">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <MessageSquare className="w-6 h-6 mr-3 text-primary" />
                Demande de réservation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input 
                      id="firstName" 
                      placeholder="Votre prénom"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Votre nom"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="votre.email@exemple.com"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    placeholder="+33 1 23 45 67 89"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="service">Service souhaité</Label>
                  <select 
                    id="service"
                    name="service"
                    className="w-full mt-2 px-3 py-2 bg-input border border-border rounded-md text-foreground"
                  >
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
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message"
                    placeholder="Décrivez votre projet musical..."
                    className="mt-2 min-h-[120px]"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full studio-button"
                  onClick={(e) => {
                    e.preventDefault();
                    const form = (e.target as HTMLElement).closest('form') as HTMLFormElement;
                    const formData = new FormData(form);
                    const subject = encodeURIComponent('Demande de réservation - Global Drip Studio');
                    const body = encodeURIComponent(`
                      Nom: ${formData.get('firstName')} ${formData.get('lastName')}
                      Email: ${formData.get('email')}
                      Téléphone: ${formData.get('phone')}
                      Service: ${formData.get('service')}
                      Message: ${formData.get('message')}
                    `);
                    window.location.href = `mailto:globaldripstudio@gmail.com?subject=${subject}&body=${body}`;
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer la demande
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
                  <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="font-medium">Téléphone</div>
                    <div className="text-muted-foreground">+33 6 59 79 73 42</div>
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
                    <div className="text-muted-foreground">
                      Lun - Ven : 10h00 - 20h00<br />
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
                  <img 
                    src="/lovable-uploads/09b9130f-1cda-4dba-8f4f-7a80c5da17ec.png"
                    alt="Global Drip Studio - Professional Audio"
                    className="h-16 object-contain opacity-80"
                  />
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
    </section>
  );
};

export default Contact;