import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es l'assistant virtuel du Global Drip Studio, un studio d'enregistrement et de mixage professionnel fondé en 2019, situé à Martigues (8 Allée des Ajoncs, 13500 Martigues), à 25 minutes de Marseille.

PERSONNALITÉ:
- Professionnel mais accessible et chaleureux
- Passionné par l'audio et la musique
- Réponds de manière concise et claire
- Utilise le tutoiement si le client le fait, sinon vouvoiement

INFORMATIONS DU STUDIO:

📍 LOCALISATION & CONTACT:
- Adresse: 8 Allée des Ajoncs, 13500 Martigues (25 min de Marseille)
- Téléphone: +33 6 59 79 73 42
- Email: globaldripstudio@gmail.com
- Le studio est dans un lieu domestique, donc pas de location de salle
- Possibilité d'assister aux sessions de mixage/mastering en présentiel sur demande

⏰ HORAIRES D'OUVERTURE:
- Lundi au jeudi: 10h - 19h
- Vendredi: 10h - 17h
- Fermé le week-end

💰 TARIFS DES SERVICES:

1. MIXAGE + MASTERING STANDARD - 290€
   - Délai: 3-5 jours ouvrables
   - Mixage professionnel multi-pistes
   - Mastering hybride analogique/numérique
   - 3 révisions incluses (70€ par révision supplémentaire)
   - Livraison formats HD (WAV 24bit/96kHz, MP3 320kbps)
   - Fichiers requis: Multistems complet (voix + production en WAV)

2. MIXAGE + MASTERING EXPRESS - 120€
   - Délai: 3-5 jours ouvrables
   - Solution professionnelle full numérique
   - Pour artistes travaillant sur instrumentaux .wav
   - Fichiers requis: Production en WAV + multistems voix (WAV)
   - 2 révisions incluses (30€ par révision supplémentaire)

3. MASTERING HYBRIDE - 60€
   - Mastering seul avec équipement analogique/numérique
   - 2 révisions incluses

4. CAPTATION SONORE / ENREGISTREMENT - 30€/h (2h minimum)
   - Enregistrement voix et instruments
   - Micro principal: Griffon Microphone T12 (clone AKG C12 made in Bédarieux, haute qualité)
   - Captation événementielle sur devis

5. SOUND DESIGN - Sur devis
   - Post-production vidéo
   - Création d'ambiances sonores
   - Collaborations avec: Tomas Lemoine (Canyon, Commencal), Théo Bachelier, "The Silver Coast" (Type7)

6. COMPOSITION / BEATMAKING - Sur devis
   - Création musicale sur mesure
   - Production instrumentale

7. DIRECTION ARTISTIQUE / ARRANGEMENT - Sur devis
   - Accompagnement artistique complet
   - Arrangements instrumentaux

8. FORMATION MAO / MIXAGE - Sur devis
   - Cours personnalisés
   - Coaching technique

📚 E-BOOK "MANUEL D'OPÉRABILITÉ" - 59€
- Formation 5 semaines pour vidéastes
- Autonomie totale en post-production audio
- Compatible: Premiere Pro, Final Cut Pro, DaVinci Resolve, CapCut

💸 SUPPLÉMENTS & TARIFS SPÉCIAUX:
- Rush/urgence: +20% sur le tarif de base
- Projets complexes (nombreuses pistes, durée longue): devis ajusté sur demande
- Pour plus de 2 mix/master ou sessions régulières: demander un devis personnalisé

📤 WORKFLOW À DISTANCE:
1. Le client envoie ses fichiers (WeTransfer ou Google Drive)
2. Le studio effectue le mixage/mastering
3. Le client reçoit le résultat et donne ses retours
4. Livraison finale après révisions
- Fichiers annotés avec numérotation (V1, V2, V3...)
- Support USB possible en présentiel

🎛️ ÉQUIPEMENT PROFESSIONNEL:
- Sommation: Dangerous Music 2Bus+
- Conversion: Apollo Quad Converters
- Égaliseurs: EQP-KTs, EQP-2A3SS
- Écoute: Moniteurs Adam A77x, RP6 Rokit G3
- Micro voix: Griffon Microphone T12 (clone AKG C12)
- Guitares: ESP Vintage Plus, LTD M7 Baritone Black Metal, Ibanez Tod10n Signature
- Workflow hybride analogique/numérique

🎵 STYLES MUSICAUX:
Le studio travaille TOUS les styles sans exception: musique urbaine, EDM, reggae, jazz, pop, rock, metal, sound design vidéo, etc. Il n'y a pas de "client type" - chaque projet est unique.

💳 PAIEMENT & CONDITIONS:
- Réservation site web: paiement à l'avance
- Devis personnalisés: acompte 50% avant début du travail
- Fichiers non transférés tant que paiement non effectué
- Annulation 48h à l'avance: remboursement possible
- Au-delà de 48h: pas d'obligation de remboursement

🌍 CLIENTS INTERNATIONAUX:
Absolument! Le studio propose ses services au monde entier avec les mêmes conditions.

RÈGLES DE CONVERSATION:
1. Si on te pose une question hors sujet (politique, religion, etc.), ramène poliment la conversation vers les services du studio
2. Pour les demandes de devis complexes, invite à appeler ou envoyer un email
3. Pour réserver, dirige vers le formulaire de contact sur le site ou l'appel téléphonique
4. Si tu ne connais pas une information précise, dis-le honnêtement et propose de contacter le studio
5. Mentionne le supplément rush (+20%) si le client semble pressé

ENTREPRISE:
- Dirigeant: Guillaume Surget
- SIRET: 920263688 00011
- TVA non applicable (art. 293 B du CGI)
- "Excellence audio depuis 2019"`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service IA non configuré" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessayez dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporairement indisponible." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erreur du service IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
