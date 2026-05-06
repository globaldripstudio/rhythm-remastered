import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Gauge, KeyRound, Drum, Music2, Music4 } from "lucide-react";
import { Link } from "react-router-dom";
import BlogArticleHeader from "@/components/blog/BlogArticleHeader";
import ShareButtons from "@/components/blog/ShareButtons";
import ContactCTA from "@/components/ContactCTA";
import SEO from "@/components/SEO";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/schemas";

const TOOLS = [
  {
    icon: Gauge,
    to: "/loudness",
    name: "Loudness Analyzer LUFS",
    short: "Mesurez la loudness intégrée, le true peak, la LRA et la dynamique de votre master directement dans le navigateur, sans upload serveur. Idéal pour vérifier qu'un mix respecte les cibles streaming (Spotify, Apple Music, YouTube) avant export final.",
    use: "Avant chaque livraison master, pour valider la conformité aux normes de diffusion et anticiper la normalisation des plateformes.",
  },
  {
    icon: KeyRound,
    to: "/key-bpm-finder",
    name: "Key & BPM Finder",
    short: "Détection automatique de la tonalité, du tempo et du code Camelot d'un fichier audio. 100% local, parfait pour DJs, producteurs et beatmakers qui veulent organiser leurs samples ou préparer un set harmonique.",
    use: "Tri rapide d'une bibliothèque de samples, repérage de la key d'un instru avant un mix DJ, ou vérification du tempo d'une boucle.",
  },
  {
    icon: Drum,
    to: "/tap-tempo-metronome",
    name: "Tap Tempo, Métronome & Calculateur BPM",
    short: "Trois outils en un : tap tempo précis, métronome avec subdivisions, et calculateur de millisecondes pour caler delays et reverbs sur le tempo. L'arsenal incontournable du producteur en studio comme en répétition.",
    use: "Trouver le BPM d'un morceau au feeling, régler un delay synchronisé sans plugin, ou répéter à un tempo stable.",
  },
  {
    icon: Music2,
    to: "/chord-progression",
    name: "Accords, gammes & modes",
    short: "Générateur de progressions d'accords avec piano et manche de guitare interactifs. Presets de morceaux célèbres (Money So Big, Rage, reggae...), choix libre de la tonique, écoute des accords à la bonne octave.",
    use: "Composer rapidement une trame harmonique, apprendre les bases du voicing, ou décortiquer la grille d'un morceau connu.",
  },
  {
    icon: Music4,
    to: "/audio-to-midi",
    name: "Audio → MIDI",
    short: "Conversion polyphonique audio vers MIDI 100% locale, basée sur Basic Pitch. Importez le résultat directement dans votre DAW pour réharmoniser, transposer ou repiquer une mélodie sans effort.",
    use: "Repiquer une ligne mélodique, transformer une voix en MIDI pour la rejouer avec un synthé, ou extraire les accords d'un sample.",
  },
];

const ToolkitArticle = () => {
  const slug = "toolkit-audio-gratuit-en-ligne";
  const title = "Le toolkit Global Drip : 5 outils audio gratuits en ligne";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Toolkit audio gratuit en ligne : 5 outils pros | Global Drip"
        description="Loudness LUFS, Key & BPM finder, tap tempo, accords interactifs et conversion Audio → MIDI : 5 outils gratuits, sans inscription, 100 % dans le navigateur."
        path={`/blog/${slug}`}
        type="article"
        publishedTime="2026-05-06"
        modifiedTime="2026-05-06"
        jsonLd={[
          articleSchema({
            title,
            description: "Présentation complète du toolkit audio gratuit Global Drip Studio : 5 outils en ligne pour analyser, composer et préparer ses productions.",
            path: `/blog/${slug}`,
            image: "/lovable-uploads/toolkit-article-cover.jpg",
            datePublished: "2026-05-06",
            section: "Toolkit",
          }),
          breadcrumbSchema([
            { name: "Blog", path: "/blog" },
            { name: title, path: `/blog/${slug}` },
          ]),
        ]}
      />
      <BlogArticleHeader />

      <article className="py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <header className="mb-8 sm:mb-12">
            <Badge className="bg-secondary text-secondary-foreground mb-4">
              <Wrench className="w-4 h-4 mr-2" />
              Toolkit
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-4 sm:mb-6">
              Cinq outils audio professionnels, gratuits et 100 % dans le navigateur, pensés pour les producteurs, DJs et ingés son.
            </p>
            <div className="flex items-center text-sm text-muted-foreground mb-6">
              <span>Global Drip Studio • 6 mai 2026 • 5 min de lecture</span>
            </div>
            <ShareButtons url={`https://globaldripstudio.fr/blog/${slug}`} />
          </header>

          <div className="prose prose-lg max-w-none text-foreground">
            <p className="text-base sm:text-lg mb-6">
              Au fil des projets passés au studio, on a constaté qu'on tirait régulièrement les mêmes petits utilitaires : un compteur LUFS pour vérifier un master, un détecteur de tonalité pour caler un sample, un métronome rapide pour valider une grille... La plupart de ces outils existent en plugin ou en logiciel dédié, mais on voulait les rendre <strong>accessibles à tous, sans installation, sans inscription, et entièrement côté navigateur</strong>. C'est l'idée derrière le toolkit Global Drip.
            </p>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Pourquoi un toolkit en ligne ?</h2>
                <p className="text-muted-foreground mb-3">
                  Trois raisons principales : la <strong>rapidité</strong> (un onglet, pas d'install), la <strong>confidentialité</strong> (les fichiers ne quittent jamais votre machine, tout est traité localement), et la <strong>simplicité</strong> (zéro courbe d'apprentissage : on ouvre, on glisse un fichier, on a la réponse).
                </p>
                <p className="text-muted-foreground">
                  Tous les outils sont conçus comme des compagnons de production : on ne remplace pas un DAW ni un plugin de mastering, on offre une vérification rapide ou un raccourci utile au quotidien.
                </p>
              </CardContent>
            </Card>

            <h2 className="text-2xl sm:text-3xl font-bold mb-6 mt-10">Les 5 outils du toolkit</h2>

            <div className="space-y-6 mb-10">
              {TOOLS.map(({ icon: Icon, to, name, short, use }) => (
                <Card key={to} className="bg-gradient-to-r from-secondary/10 to-primary/10 border-border">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="rounded-lg bg-primary/15 p-2.5 shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                          <Link to={to} className="hover:text-primary transition-colors">
                            {name}
                          </Link>
                        </h3>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">{short}</p>
                    <p className="text-sm text-muted-foreground/90">
                      <strong className="text-foreground">Cas d'usage :</strong> {use}
                    </p>
                    <div className="mt-4">
                      <Link
                        to={to}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                      >
                        Ouvrir l'outil →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-secondary/20">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Une philosophie : faire simple, faire utile</h2>
                <p className="text-muted-foreground mb-3">
                  Pas de plugin à installer, pas de compte à créer, pas de file d'attente. <strong>Aucun fichier n'est envoyé sur un serveur : tout reste dans votre onglet.</strong> C'est un parti pris : votre projet ne nous appartient pas, et il n'a aucune raison de transiter ailleurs que sur votre machine.
                </p>
                <p className="text-muted-foreground">
                  Côté ergonomie, on a passé un temps fou à dégraisser. Chaque outil est pensé comme un instrument de précision : juste ce qu'il faut d'options, des résultats lisibles, et <strong>des résultats interprétables sans formation technique. Le but : qu'un beatmaker débutant comme un ingé son confirmé y trouve son compte en moins de trente secondes.</strong>
                </p>
              </CardContent>
            </Card>

            <ContactCTA />
          </div>

          <div className="mt-10 pt-6 border-t border-border">
            <ShareButtons url={`https://globaldripstudio.fr/blog/${slug}`} />
          </div>
        </div>
      </article>
    </div>
  );
};

export default ToolkitArticle;
