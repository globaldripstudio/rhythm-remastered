import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CGV = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-24">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Button>

        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          Conditions Générales de <span className="hero-text">Vente</span>
        </h1>

        <div className="prose prose-invert max-w-4xl space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Objet</h2>
            <p className="text-muted-foreground">
              Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre 
              Global Drip Worldwide, ci‑après « le Studio », et tout client professionnel ou non professionnel, 
              ci‑après « le Client », pour les prestations de services audio proposées par le Studio. Toute commande 
              implique l'acceptation pleine et entière des présentes CGV, sauf conditions particulières stipulées 
              par écrit et signées des deux parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Services proposés</h2>
            <p className="text-muted-foreground mb-4">Le Studio propose notamment :</p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li><strong className="text-foreground">Mixage audio :</strong> équilibrage, corrections tonales, dynamique, spatialisation, cohérence entre scènes.</li>
              <li><strong className="text-foreground">Mixage + Mastering (Standard et Express) :</strong> optimisation du rendu final et préparation à la diffusion.</li>
              <li><strong className="text-foreground">Mastering hybride analogique/numérique :</strong> chaîne analogique/numérique selon le projet, respect des normes de diffusion.</li>
              <li><strong className="text-foreground">Sound design :</strong> création/édition d'effets, foley, textures, impacts, transitions, signature sonore.</li>
              <li><strong className="text-foreground">Enregistrement studio et captation terrain :</strong> prise de son voix/instruments/ambiances, direction de prise.</li>
              <li><strong className="text-foreground">Composition et beatmaking :</strong> musique originale, déclinaisons/stems, habillage identitaire.</li>
              <li><strong className="text-foreground">Direction artistique et arrangement :</strong> conseil éditorial, structure, instrumentation, accompagnement créatif.</li>
              <li><strong className="text-foreground">Formation MAO et mixage :</strong> sessions pédagogiques sur outils/flux de travail/méthodologies.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              <strong className="text-foreground">Remarques :</strong><br />
              • Les contenus et livrables exacts (formats, stems, variantes) sont précisés au devis/bon de commande.<br />
              • Sauf mention contraire, les licences/logiciels/voix off/bibliothèques tierces ne sont pas inclus et peuvent faire l'objet de coûts additionnels.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Tarifs et paiement</h2>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Les tarifs sont indiqués en euros TTC sur le site et/ou sur devis. Les prestations « sur devis » font l'objet d'une proposition commerciale personnalisée.</li>
              <li>Un acompte de 50 % peut être demandé à la commande ; le solde est exigible à la livraison des fichiers finaux. Pas de livraison sans paiement intégral.</li>
              <li>Moyens de paiement acceptés : virement bancaire, PayPal, espèces.</li>
              <li>Escompte pour paiement anticipé : aucun. En cas de retard de paiement (clients professionnels), des pénalités de retard sont exigibles de plein droit au taux légal majoré, ainsi qu'une indemnité forfaitaire de 40 € pour frais de recouvrement (art. L441‑10 C. com.).</li>
              <li>Toute taxe, droit ou frais bancaires supplémentaires à l'international reste à la charge du Client.</li>
              <li>Les droits d'exploitation et/ou la licence (cf. article 7) ne sont concédés qu'après paiement intégral.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Commande et validation</h2>
            <p className="text-muted-foreground mb-4">Une commande devient ferme après :</p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Acceptation du devis/bon de commande (« bon pour accord ») par le Client (signature ou accord électronique).</li>
              <li>Réception de l'acompte, le cas échéant.</li>
              <li>Réception des éléments nécessaires (assets, consignes, planning).</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Le Client garantit la fourniture d'éléments exploitables et disposant des droits nécessaires. Tout retard 
              de transmission, changement de brief ou asset non conforme peut impacter le planning et le coût.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Délais de livraison</h2>
            <p className="text-muted-foreground mb-4">Délais indicatifs (sauf mention contraire au devis) :</p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li><strong className="text-foreground">Mixage + Mastering Standard :</strong> 3 à 5 jours ouvrés.</li>
              <li><strong className="text-foreground">Mixage + Mastering Express :</strong> 4 heures (sous réserve de créneau et d'assets conformes).</li>
              <li><strong className="text-foreground">Sound design :</strong> selon complexité du projet.</li>
              <li><strong className="text-foreground">Autres prestations :</strong> délai indiqué au devis.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Le Studio informe le Client de tout aléa significatif. Les délais s'entendent hors validations/retours 
              du Client et hors cas de force majeure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Révisions</h2>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li><strong className="text-foreground">Mixage + Mastering Standard :</strong> 3 révisions incluses.</li>
              <li><strong className="text-foreground">Mixage + Mastering Express :</strong> 2 révisions incluses.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              <strong className="text-foreground">Définition :</strong> une révision = ajustements ciblés (niveaux, EQ, dynamiques, transitions, balances, micro‑édits).
            </p>
            <p className="text-muted-foreground mt-2">
              <strong className="text-foreground">Sont exclus des révisions incluses :</strong> changement de brief, remplacement massif de pistes, 
              nouveau montage, ajout de versions supplémentaires, refonte d'arrangement/composition.
            </p>
            <p className="text-muted-foreground mt-2">
              Toute révision supplémentaire est facturée selon un tarif communiqué au préalable. L'absence de retour 
              sous 7 jours calendaires après livraison vaut validation des livrables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Propriété intellectuelle</h2>
            
            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">7.1 Œuvres et éléments du Client</h3>
            <p className="text-muted-foreground">
              Le Client demeure titulaire de l'ensemble des droits sur ses œuvres et éléments préexistants fournis 
              (images, logos, textes, vidéos, voix, musiques préexistantes, etc.) et garantit au Studio la légitimité de leur usage.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">7.2 Méthodes, savoir‑faire et fichiers source du Studio</h3>
            <p className="text-muted-foreground">
              Le Studio conserve l'entière propriété de ses méthodes, techniques, presets, banques, templates, ainsi que des 
              fichiers sources et projets (sessions DAW, pistes individuelles non livrées par défaut). La remise de fichiers 
              source peut faire l'objet d'une option et d'une tarification dédiée.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">7.3 Créations du Studio</h3>
            <p className="text-muted-foreground">
              En droit français, l'œuvre de commande n'emporte pas cession automatique. Sauf stipulation écrite contraire, 
              les créations réalisées par le Studio (composition originale, arrangement, sound design original, enregistrements 
              et masters) restent sa propriété intellectuelle et/ou celle de ses auteurs et ayants droit.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">7.4 Clause explicite — rôles de compositeur/arrangeur/sound designer</h3>
            <p className="text-muted-foreground">
              Lorsque le Studio intervient en tant que compositeur, arrangeur ou sound designer, le Client n'acquiert pas, 
              par défaut, la propriété desdites œuvres, ni des masters correspondants. Le Client bénéficie uniquement d'une 
              licence d'exploitation conformément à l'article 7.5, sauf cession écrite spécifique conforme à l'article 7.6.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">7.5 Licence d'exploitation par défaut</h3>
            <p className="text-muted-foreground">
              À la livraison et sous réserve du paiement intégral, le Studio concède au Client une licence non exclusive, 
              non transférable et non sous‑licenciable, limitée :
            </p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6 mt-2">
              <li>au projet audiovisuel identifié et à ses déclinaisons directes (durées/formats),</li>
              <li>aux supports/plateformes convenus (ex: site, YouTube, réseaux sociaux de la marque, diffusion événementielle),</li>
              <li>au territoire et à la durée convenus au devis.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Toute autre utilisation (TV/radio, campagnes paid à large diffusion, jeux/applications, réutilisation autonome 
              des pistes, remix/adaptation substantielle, cession à des tiers, synchronisations additionnelles) requiert un 
              accord écrit et une rémunération complémentaire. Les masters livrés ne peuvent être exploités séparément du 
              projet sans accord préalable.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">7.6 Cession de droits (si applicable)</h3>
            <p className="text-muted-foreground">
              Toute cession (totale/partielle, exclusive/non exclusive) doit être formalisée par écrit, signée des parties, 
              en précisant pour chaque mode d'exploitation la durée, le territoire, les supports, l'étendue et la rémunération. 
              La cession n'est acquise qu'après paiement intégral. Les droits moraux des auteurs (paternité, respect de l'œuvre) 
              demeurent inaliénables.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">7.7 Droits de tiers</h3>
            <p className="text-muted-foreground">
              Les droits de tiers (comédiens voix, musiciens, interprètes, producteurs de phonogrammes, banques de sons, plugins, 
              polices, etc.) font l'objet d'autorisations/licences distinctes. Leur coût, périmètre et contraintes d'usage sont 
              précisés au devis ou, à défaut, nécessitent un accord complémentaire.
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">7.8 Crédits et mentions</h3>
            <p className="text-muted-foreground">
              Sauf contrordre écrit, le Studio peut être crédité sur le projet (ex.: « Sound design/Mix — Global Drip Studio 
              (Guillaume Surget) »). Le Client respecte les droits moraux (paternité, intégrité des œuvres).
            </p>

            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">7.9 Promotion (portfolio)</h3>
            <p className="text-muted-foreground">
              Sauf clause de confidentialité/embargo convenue par écrit, et sous réserve de l'accord préalable du Client sur 
              les extraits, le Studio est autorisé à citer le projet et à en diffuser des extraits raisonnables à des fins de 
              promotion (site, portfolio, réseaux sociaux, démarchage).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Annulation</h2>
            <p className="text-muted-foreground mb-2"><strong className="text-foreground">Par le Client :</strong></p>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Avant le début des travaux : remboursement de l'acompte moins 20 % de frais de dossier.</li>
              <li>Après le début des travaux : aucun remboursement de l'acompte ; les travaux engagés restent dus.</li>
            </ul>
            <p className="text-muted-foreground mt-4 mb-2"><strong className="text-foreground">Par le Studio :</strong></p>
            <p className="text-muted-foreground">
              En cas de force majeure ou circonstances exceptionnelles, remboursement des sommes perçues au prorata des 
              travaux non réalisés, sans autre indemnité.
            </p>
            <p className="text-muted-foreground mt-4">
              Les frais externes engagés (location, déplacements, prestataires tiers) restent dus/à la charge de la partie 
              qui annule si non remboursables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Responsabilité</h2>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Le Studio fournit ses prestations selon les règles de l'art et une obligation de moyens. Il ne saurait être 
              tenu pour responsable des dommages indirects/immatériels (perte d'exploitation, d'image, de données, retard 
              imputable à des tiers).</li>
              <li>Le Client est responsable de la qualité des fichiers sources et de la détention des droits sur les œuvres. 
              Le Studio ne garantit pas l'aptitude des livrables à un usage non spécifié au devis.</li>
              <li>La conformité technique (loudness, true peak, formats) est délivrée pour les plateformes/chaînes explicitement 
              visées. Toute évolution de normes postérieure à la livraison peut nécessiter une mise à jour facturée.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Confidentialité</h2>
            <p className="text-muted-foreground">
              Le Studio s'engage à préserver la confidentialité des informations et contenus non publics communiqués par le 
              Client, pendant la durée du projet et 3 ans après sa fin. Ne sont pas confidentielles les informations déjà 
              publiques ou obtenues légitimement de tiers. Les obligations peuvent être adaptées par NDA spécifique.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">11. Litiges</h2>
            <p className="text-muted-foreground">
              En cas de litige, les parties recherchent une solution amiable de bonne foi sous 30 jours. À défaut, les 
              tribunaux compétents du ressort du siège du Studio sont seuls compétents. Le droit français est applicable 
              aux présentes CGV.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">12. Contact</h2>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Global Drip Worldwide</strong><br />
              Email : globaldripstudio@gmail.com<br />
              Téléphone : +33 6 59 79 73 42<br />
              Adresse : 8 allée des ajoncs, 13500 Martigues, France
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">13. Données personnelles (RGPD)</h2>
            <p className="text-muted-foreground">
              Les données personnelles du Client (contact, facturation, échanges) sont traitées aux fins d'exécution du contrat, 
              de facturation et de suivi. Base légale : exécution contractuelle/intérêt légitime. Durée de conservation : durée 
              de la relation contractuelle + obligations légales (comptabilité).
            </p>
            <p className="text-muted-foreground mt-4">
              <strong className="text-foreground">Droits du Client :</strong> accès, rectification, effacement, limitation, 
              opposition, portabilité (dans les limites légales). Demande à adresser à l'email indiqué à l'article 12.
            </p>
            <p className="text-muted-foreground mt-4">
              Le Studio peut recourir à des sous‑traitants (hébergeurs, outils collaboratifs) offrant des garanties adéquates ; 
              la liste principale peut être communiquée sur demande.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">14. Sous‑traitance et collaborateurs</h2>
            <p className="text-muted-foreground">
              Le Studio peut, lorsque nécessaire, confier tout ou partie d'une prestation à des collaborateurs/sous‑traitants 
              spécialisés (voix off, musiciens, ingénieurs, coloristes, etc.) sous sa responsabilité, sans préjudice pour le 
              Client, dans le respect des engagements de confidentialité et de qualité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">15. Frais annexes et conditions opérationnelles</h2>
            <p className="text-muted-foreground">
              Sauf mention contraire, ne sont pas inclus : frais de déplacement/hébergement/per diem, location de matériel/studio 
              tiers, rémunération d'artistes/interprètes, licences musicales/bibliothèques, droits voisins, coûts de diffusion/clearances.
            </p>
            <p className="text-muted-foreground mt-4">
              <strong className="text-foreground">Captation terrain :</strong> le Client assure l'accès, les autorisations de tournage, 
              la sécurité et les assurances nécessaires. Les temps d'attente/retards non imputables au Studio peuvent être facturés.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">16. Livrables, formats et archivage</h2>
            <ul className="text-muted-foreground space-y-2 list-disc pl-6">
              <li>Sauf stipulation contraire, le master est livré en WAV stéréo 24‑bit/48 kHz ; autres formats (MP3, multisorties, 
              stems, M&E, versions sociales) sur demande/devis.</li>
              <li>Un rapport de contrôle (loudness/true peak) peut être fourni lorsque pertinent.</li>
              <li><strong className="text-foreground">Archivage :</strong> le Studio conserve les sessions et assets sur une base de 
              moyens raisonnables pendant 90 jours après livraison ; au‑delà, aucune garantie de conservation. Un service 
              d'archivage/relivraison peut être proposé en option.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">17. Communication et crédits</h2>
            <p className="text-muted-foreground">
              Le Client s'engage à ne pas retirer ni altérer les crédits convenus. Toute communication du Studio sur le projet 
              respecte les éventuels embargos/clauses de confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">18. Modification des CGV</h2>
            <p className="text-muted-foreground">
              Le Studio se réserve la possibilité d'adapter les présentes CGV à tout moment. Les CGV applicables sont celles 
              en vigueur à la date d'acceptation du devis par le Client.
            </p>
          </section>

          <section>
            <p className="text-muted-foreground text-sm italic">
              Dernière mise à jour : Janvier 2025
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CGV;
