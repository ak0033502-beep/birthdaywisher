import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Disclaimer | BirthdayWisher.fun",
    description: "Disclaimer for BirthdayWisher.fun — information about the use of our free birthday wish creator service, third-party links, and liability limitations.",
};

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <main className="container max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-black mb-8">Disclaimer</h1>
                <p className="text-foreground/60 mb-12">Last Updated: July 2026</p>

                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-xl text-foreground/80 leading-relaxed font-medium mb-8">
                        The information provided by BirthdayWisher.fun (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) on <a href="https://birthdaywisher.fun" className="text-primary hover:underline">birthdaywisher.fun</a> (the &quot;Site&quot;) is for general informational and entertainment purposes only.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">1. General Information</h2>
                    <p className="text-foreground/70 leading-relaxed">
                        All information on the Site is provided in good faith. However, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site. Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the Site or reliance on any information provided on the Site. Your use of the Site and your reliance on any information on the Site is solely at your own risk.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">2. External Links Disclaimer</h2>
                    <p className="text-foreground/70 leading-relaxed">
                        The Site may contain (or you may be sent through the Site) links to other websites or content belonging to or originating from third parties or links to websites and features in banners or other advertising. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us. We do not warrant, endorse, guarantee, or assume responsibility for the accuracy or reliability of any information offered by third-party websites linked through the Site or any website or feature linked in any banner or other advertising.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">3. Advertisements Disclaimer</h2>
                    <p className="text-foreground/70 leading-relaxed">
                        The Site may use Google AdSense or other advertising networks to display advertisements. These advertisements are provided by third-party ad networks and we have no control over the content of these ads. The presence of ads on this Site does not constitute an endorsement or recommendation by us of any advertiser or their products/services. Advertisers are solely responsible for their own advertising content.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">4. User-Generated Content</h2>
                    <p className="text-foreground/70 leading-relaxed">
                        BirthdayWisher.fun allows users to create birthday wishes and anniversary greetings. The content created by users (text, images, messages) is the sole responsibility of the user who created it. We are not responsible for any content created, shared, or distributed by users through our platform. Users must ensure that their content does not violate any laws, infringe on intellectual property rights, or contain harmful or offensive material.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">5. No Professional Advice</h2>
                    <p className="text-foreground/70 leading-relaxed">
                        The Site cannot and does not contain professional advice. The entertainment and greeting card content is provided for general informational and entertainment purposes only. It is not a substitute for professional advice. Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">6. Fair Use Disclaimer</h2>
                    <p className="text-foreground/70 leading-relaxed">
                        This Site may use copyrighted material which has not always been specifically authorized by the copyright owner. We make such material available for purposes of creating personalized greetings and entertainment. We believe this constitutes a &quot;fair use&quot; of any such copyrighted material. If you wish to use copyrighted material from this Site for purposes of your own that go beyond &quot;fair use,&quot; you must obtain permission from the copyright owner.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">7. Errors and Omissions</h2>
                    <p className="text-foreground/70 leading-relaxed">
                        While we have made every attempt to ensure that the information contained on this Site has been obtained from reliable sources, BirthdayWisher.fun is not responsible for any errors or omissions, or for the results obtained from the use of this information. All information on this Site is provided &quot;as is,&quot; with no guarantee of completeness, accuracy, timeliness, or of the results obtained from the use of this information.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">8. Contact Us</h2>
                    <p className="text-foreground/70 leading-relaxed">
                        If you have any questions about this Disclaimer, please contact us at{" "}
                        <a href="mailto:akalloverservices@gmail.com" className="text-primary hover:underline">akalloverservices@gmail.com</a>.
                    </p>

                    <div className="mt-16 p-6 rounded-2xl bg-foreground/5 border border-foreground/10">
                        <p className="text-foreground/60 text-center text-sm">
                            By using BirthdayWisher.fun, you hereby consent to our Disclaimer and agree to its terms.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
