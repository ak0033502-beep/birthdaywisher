import { Metadata } from "next";

export const metadata: Metadata = {
    title: "DMCA Policy | BirthdayWisher.fun",
    description: "DMCA takedown policy for BirthdayWisher.fun. Learn how to report copyright infringement on our platform.",
};

export default function DMCAPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-24">
            <main className="container max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-5xl font-black mb-8">DMCA Policy</h1>
                <p className="text-foreground/60 mb-12">Last Updated: July 2026</p>

                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-xl text-foreground/80 leading-relaxed font-medium mb-8">
                        BirthdayWisher.fun respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond expeditiously to claims of copyright infringement committed using our service.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">1. Copyright Infringement Notification</h2>
                    <p className="text-foreground/70 leading-relaxed">
                        If you believe that content available on or through BirthdayWisher.fun infringes one or more of your copyrights, please notify us by providing a DMCA notice containing the following information:
                    </p>
                    <ul className="text-foreground/70 leading-relaxed space-y-2">
                        <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf</li>
                        <li>Identification of the copyrighted work claimed to have been infringed</li>
                        <li>Identification of the material that is claimed to be infringing and that is to be removed, with enough detail so that we may locate it</li>
                        <li>Your contact information, including address, telephone number, and email address</li>
                        <li>A statement that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law</li>
                        <li>A statement, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner&apos;s behalf</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-12 mb-4">2. Where to Send DMCA Notices</h2>
                    <p className="text-foreground/70 leading-relaxed">
                        Please send all DMCA takedown notices to:
                    </p>
                    <div className="p-4 rounded-xl bg-foreground/5 border border-foreground/10 my-4">
                        <p className="text-foreground/80">
                            <strong>Email:</strong>{" "}
                            <a href="mailto:akalloverservices@gmail.com" className="text-primary hover:underline">akalloverservices@gmail.com</a>
                        </p>
                        <p className="text-foreground/80">
                            <strong>Subject Line:</strong> DMCA Takedown Request — BirthdayWisher.fun
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold mt-12 mb-4">3. Counter-Notification</h2>
                    <p className="text-foreground/70 leading-relaxed">
                        If you believe that your content was removed or disabled by mistake or misidentification, you may submit a counter-notification containing the following:
                    </p>
                    <ul className="text-foreground/70 leading-relaxed space-y-2">
                        <li>Your physical or electronic signature</li>
                        <li>Identification of the content that was removed and the location where it appeared before removal</li>
                        <li>A statement under penalty of perjury that you have a good faith belief the content was removed by mistake or misidentification</li>
                        <li>Your name, address, telephone number, and a statement that you consent to the jurisdiction of the courts in your area</li>
                    </ul>

                    <h2 className="text-2xl font-bold mt-12 mb-4">4. Repeat Infringers</h2>
                    <p className="text-foreground/70 leading-relaxed">
                        BirthdayWisher.fun will promptly terminate, without notice, any user&apos;s access to the service if that user is determined to be a &quot;repeat infringer.&quot; A repeat infringer is a user who has been notified of infringing activity more than twice and/or has had content removed from the service more than twice.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-4">5. Modifications</h2>
                    <p className="text-foreground/70 leading-relaxed">
                        BirthdayWisher.fun reserves the right to modify, alter, or update this DMCA Policy at any time. Changes will be posted on this page with an updated &quot;Last Updated&quot; date. We encourage visitors to review this policy periodically.
                    </p>

                    <div className="mt-16 p-6 rounded-2xl bg-foreground/5 border border-foreground/10">
                        <p className="text-foreground/60 text-center text-sm">
                            We take copyright matters seriously. If you have any questions about this policy, please email us at{" "}
                            <a href="mailto:akalloverservices@gmail.com" className="text-primary hover:underline">akalloverservices@gmail.com</a>.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
