import { MainLayout } from "@/components/layout/main-layout";

export const metadata = {
 title: "Mentions Légales | KAIRO Digital - Développeur web à Belfort",
 description:
 "Mentions légales et informations juridiques de KAIRO Digital, entreprise de développement web basée à Belfort. Consultez nos conditions d'utilisation et notre politique de confidentialité.",
 keywords:
 "mentions légales, KAIRO Digital, politique de confidentialité, RGPD, conditions d'utilisation, développement web Belfort",
 alternates: {
 canonical: "https://www.kairo-digital.fr/mentions-legales",
 },
};

export default function MentionsLegalesPage() {
 return (
 <MainLayout>
 <section className="pt-32 pb-20 bg-white">
 <div className="container mx-auto px-4">
 <h1 className="text-4xl font-bold mb-12 text-center">
 Mentions Légales
 </h1>

 <div className="max-w-4xl mx-auto">
 <div className="prose max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-neutral-700:text-neutral-300 prose-p:my-4 prose-a:text-blue-700:text-blue-400 prose-a:no-underline hover:prose-a:underline">
 <p className="text-sm opacity-70">
 Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
 </p>

 <h2>1. Identité de l&apos;éditeur du site</h2>
 <ul>
 <li>KAIRO Digital</li>
 <li>SIRET : 942 843 012 00017</li>
 <li>Adresse : Belfort</li>
 </ul>

 <h2>2. Coordonnées</h2>
 <ul>
 <li>Email : contact@kairo-digital.fr</li>
 <li>Téléphone : 07 66 12 16 96</li>
 </ul>

 <h2>3. Directeur de publication</h2>
 <p>Hilaire Bryan</p>

 <h2>4. Informations sur l&apos;hébergeur</h2>
 <p>
 Ce site est hébergé par Heroku, une plateforme cloud appartenant
 à Salesforce. Les serveurs de Heroku sur lesquels le site est
 hébergé sont situés aux États-Unis.
 </p>
 <p>
 Pour contacter l&apos;hébergeur :
 <a
 href="https://www.heroku.com"
 target="_blank"
 rel="noopener noreferrer"
 >
 www.heroku.com
 </a>
 </p>

 <h2>5. Propriété intellectuelle</h2>
 <p>
 Tout le contenu présent sur le site www.kairo-digital.fr,
 incluant, de manière non limitative, les graphismes, images,
 textes, vidéos, animations, sons, logos, gifs et icônes ainsi
 que leur mise en forme sont la propriété exclusive de la société
 à l&apos;exception des marques, logos ou contenus appartenant à
 d&apos;autres sociétés partenaires ou auteurs.
 </p>
 <p>
 Toute reproduction, distribution, modification, adaptation,
 retransmission ou publication, même partielle, de ces différents
 éléments est strictement interdite sans l&apos;accord exprès par
 écrit de KAIRO Digital. Cette représentation ou reproduction,
 par quelque procédé que ce soit, constitue une contrefaçon
 sanctionnée par les articles L.335-2 et suivants du Code de la
 propriété intellectuelle.
 </p>
 <p>
 Le non-respect de cette interdiction constitue une contrefaçon
 pouvant engager la responsabilité civile et pénale du
 contrefacteur. En outre, les propriétaires des Contenus copiés
 pourraient tenter une action en justice à votre encontre.
 </p>

 <h2>6. Données personnelles</h2>
 <p>
 De manière générale, vous n&apos;êtes pas tenu de nous
 communiquer vos données personnelles lorsque vous visitez notre
 site Internet www.kairo-digital.fr. Cependant, ce principe
 comporte certaines exceptions. En effet, pour certains services
 proposés par notre site, vous pouvez être amenés à nous
 communiquer certaines données telles que : votre nom, votre
 fonction, le nom de votre société, votre adresse électronique,
 et votre numéro de téléphone. Tel est le cas lorsque vous
 remplissez le formulaire qui vous est proposé en ligne, dans la
 rubrique « contact ».
 </p>
 <p>
 Dans tous les cas, vous pouvez refuser de fournir vos données
 personnelles. Dans ce cas, vous ne pourrez pas utiliser les
 services du site, notamment celui de solliciter des
 renseignements sur notre société, ou de recevoir les lettres
 d&apos;information.
 </p>
 <p>
 Enfin, nous pouvons collecter de manière automatique certaines
 informations vous concernant lors d&apos;une simple navigation
 sur notre site Internet, notamment : des informations concernant
 l&apos;utilisation de notre site, comme les zones que vous
 visitez et les services auxquels vous accédez, votre adresse IP,
 le type de votre navigateur, vos temps d&apos;accès.
 </p>
 <p>
 De telles informations sont utilisées exclusivement à des fins
 de statistiques internes, de manière à améliorer la qualité des
 services qui vous sont proposés. Les bases de données sont
 protégées par les dispositions de la loi du 1er juillet 1998
 transposant la directive 96/9 du 11 mars 1996 relative à la
 protection juridique des bases de données.
 </p>

 <h2>7. Conditions d&apos;utilisation</h2>
 <p>
 L&apos;utilisation du site www.kairo-digital.fr implique
 l&apos;acceptation pleine et entière des conditions générales
 d&apos;utilisation décrites ci-dessus. Ces conditions
 d&apos;utilisation sont susceptibles d&apos;être modifiées ou
 complétées à tout moment.
 </p>
 <p>
 Le site www.kairo-digital.fr est mis à jour régulièrement. De la
 même façon, les mentions légales peuvent être modifiées à tout
 moment : elles s&apos;imposent néanmoins à l&apos;utilisateur
 qui est invité à s&apos;y référer le plus souvent possible afin
 d&apos;en prendre connaissance.
 </p>
 <p>
 Le site www.kairo-digital.fr s&apos;efforce de fournir des
 informations aussi précises que possible. Toutefois, il ne
 pourra être tenu responsable des omissions, des inexactitudes et
 des carences dans la mise à jour, qu&apos;elles soient de son
 fait ou du fait des tiers partenaires qui lui fournissent ces
 informations.
 </p>

 <h2>8. Règlement des litiges</h2>
 <p>
 Les présentes conditions d&apos;utilisation du site sont régies
 par les lois françaises et toute contestation ou litiges qui
 pourraient naître de l&apos;interprétation ou de
 l&apos;exécution de celles-ci seront de la compétence exclusive
 des tribunaux de Belfort.
 </p>
 <p>
 La langue de référence, pour le règlement de contentieux
 éventuels, est le français.
 </p>
 </div>
 </div>
 </div>
 </section>
 </MainLayout>
 );
}
