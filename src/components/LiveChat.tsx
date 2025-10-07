import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Bonjour ! Je suis l'assistant virtuel du Global Drip Studio. Comment puis-je vous aider aujourd'hui ?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const faqDatabase = {
    "styles musicaux": "Au Global Drip Studio, nous travaillons tous les styles de musique. Notre large expérience du travail en studio nous permet d'avoir une réponse adaptée à chaque besoin, aussi bien en terme de mixage et mastering qu'en terme de captation : musique urbaine, EDM, reggae, jazz, pop, rock, sound design adapté au support vidéo, etc.",
    
    "délai": "Il faudra compter en moyenne 2 jours ouvrables pour la réalisation d'un mixage/mastering, révisions comprises. Pour cela, vous êtes naturellement invité à être réactif et à rédiger des notes de retour mix claires afin de fluidifier le workflow et vous fournir un rendu final le plus rapidement possible.",
    
    "révisions": "Pour le mixage : 3 révisions (70€ de surcoût au-delà). Pour le mastering : 2 révisions (30€ de surcoût au-delà). Résultats garantis.",
    
    "réductions": "Au-delà de deux mix/master ou d'une volonté de venir enregistrer régulièrement au Global Drip Studio, il vous est conseillé d'effectuer une demande de devis (gratuite) plutôt que de réserver directement sur le site.",
    
    "location": "Le Global Drip Studio se trouvant actuellement au cœur d'un lieu domestique, le studio n'est pas louable.",
    
    "réalisations": "Dans la rubrique 'Projets' du menu d'en-tête, vous trouverez les artistes que nous avons décidé de mettre en avant, et pourrez écouter des réalisations sur lesquelles le Global Drip Studio a participé en cliquant sur 'En savoir plus'.",
    
    "adresse": "Le Global Drip Studio se situe au 8 allée des Ajoncs, 13500 Martigues, à 25 minutes de Marseille. Il est possible sur demande d'assister aux sessions de mixage/mastering en présentiel.",
    
    "contact": "Oui, et c'est même vivement conseillé ! Contactez la ligne du studio aux horaires d'ouverture de 10h à 19h du lundi au jeudi et de 10h à 17h le vendredi au +33 6 59 79 73 42. Il y a de fortes chances que l'ingénieur soit au travail durant ces heures, alors n'hésitez pas à laisser un message vocal ou à nous envoyer un SMS si vous tombez sur le répondeur.",
    
    "paiement": "Toute réservation effectuée via le site vous incombe de régler la facture à l'avance. Pour les réservations faites au téléphone pour de l'enregistrement, sachez que vos fichiers ne vous seront pas transférés tant que vous n'aurez pas effectué le paiement. En ce qui concerne les devis, un acompte de 50% vous sera demandé avant de commencer le travail. Les demandes de réservation annulées 48h à l'avance peuvent vous être remboursées ; passé ce délai, le studio n'est pas tenu à cette obligation.",
    
    "transfert": "Si nous travaillons en distanciel, nous préconisons WeTransfer ou Google Drive. Si nous avons l'occasion de travailler en présentiel, alors il est possible que vous rameniez votre support de stockage USB. Les différentes versions d'un projet seront toujours annotées (MAP, PREMIX, SUMMING MIX, MASTER) et numérotées (V1, V2, V3, etc.) en fonction de l'étape à laquelle nous nous trouvons.",
    
    "international": "Absolument pas, le Global Drip Studio propose ses services au monde entier. Les mêmes règles énoncées ci-dessus s'appliquent aux clients étrangers.",
    
    "prix": "Mixage + Mastering : 290€, Mastering Hybride : 60€, Mixage Studio : 230€. Pour des projets sur mesure, contactez-nous pour un devis personnalisé.",
    
    "horaires": "Lundi au jeudi : 10h-19h. Vendredi : 10h-17h. Fermé le week-end."
  };

  const findAnswer = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    for (const [key, answer] of Object.entries(faqDatabase)) {
      if (lowerQuery.includes(key)) {
        return answer;
      }
    }
    
    // Fallback responses
    if (lowerQuery.includes("bonjour") || lowerQuery.includes("salut") || lowerQuery.includes("hello")) {
      return "Bonjour ! Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions sur nos services, tarifs, délais, ou localisation.";
    }
    
    if (lowerQuery.includes("merci")) {
      return "Je vous en prie ! N'hésitez pas si vous avez d'autres questions. Vous pouvez également nous contacter directement au +33 6 59 79 73 42 ou par email à globaldripstudio@gmail.com.";
    }
    
    return "Je n'ai pas trouvé de réponse exacte à votre question. Pour des informations plus spécifiques, n'hésitez pas à nous contacter directement au +33 6 59 79 73 42 ou par email à globaldripstudio@gmail.com. Vous pouvez aussi consulter notre page Projets ou Services pour plus de détails.";
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: findAnswer(inputValue),
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg studio-button p-0 hover:scale-110 transition-transform"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-96 shadow-2xl border-primary/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-background/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-background" />
          </div>
          <div>
            <h3 className="font-bold text-background">Global Drip Studio</h3>
            <p className="text-xs text-background/80">Assistant virtuel</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-background hover:bg-background/20"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-background hover:bg-background/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="h-96 p-4 bg-muted/10">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isBot
                        ? "bg-card border border-border"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.isBot ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                      {message.timestamp.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Posez votre question..."
                className="flex-1"
              />
              <Button onClick={handleSend} className="studio-button">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Questions fréquentes : tarifs, délais, styles musicaux, localisation
            </p>
          </div>
        </>
      )}
    </Card>
  );
};

export default LiveChat;
