import { useLayoutEffect } from 'react';
import { BUSINESS_NAME, FULL_BUSINESS_NAME } from 'utils/consts';
import { Typography } from '@material-ui/core';
import PolicyBreadcrumbs from 'components/breadcrumbs/PolicyBreadcrumbs/PolicyBreadcrumbs';

function PrivacyPolicyPage() {

    useLayoutEffect(() => {
        document.title = `Privacy Policy | ${BUSINESS_NAME}`;
    })

    return (
        <div id="page">
            <PolicyBreadcrumbs />
            <Typography variant="h3">Privacy Policy</Typography>
            <p>Last updated: November 30, 2020</p>
            <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>
            <p>We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy. This Privacy Policy has been created with the help of the <a href="https://www.termsfeed.com/privacy-policy-generator/">Privacy Policy Generator</a>.</p>
            <Typography variant="h3">Interpretation and Definitions</Typography>
            <Typography variant="h4">Interpretation</Typography>
            <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
            <Typography variant="h4">Definitions</Typography>
            <p>For the purposes of this Privacy Policy:</p>
            <ul>
                <li>
                    <p><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</p>
                </li>
                <li>
                    <p><strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Agreement) refers to New Life Nusery Inc., 106 South Woodruff Road, Bridgeton NJ 08302.</p>
                </li>
                <li>
                    <p><strong>Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.</p>
                </li>
                <li>
                    <p><strong>Country</strong> refers to: New Jersey,  United States</p>
                </li>
                <li>
                    <p><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</p>
                </li>
                <li>
                    <p><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</p>
                </li>
                <li>
                    <p><strong>Service</strong> refers to the Website.</p>
                </li>
                <li>
                    <p><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.</p>
                </li>
                <li>
                    <p><strong>Third-party Social Media Service</strong> refers to any website or any social network website through which a User can log in or create an account to use the Service.</p>
                </li>
                <li>
                    <p><strong>Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).</p>
                </li>
                <li>
                    <p><strong>Website</strong> refers to {BUSINESS_NAME}, accessible from <a href="https://newlifenurseryinc.com" rel="external nofollow noopener">https://newlifenurseryinc.com</a></p>
                </li>
                <li>
                    <p><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</p>
                </li>
            </ul>
            <Typography variant="h3">Collecting and Using Your Personal Data</Typography>
            <Typography variant="h4">Types of Data Collected</Typography>
            <Typography variant="h5">Personal Data</Typography>
            <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:</p>
            <ul>
                <li>
                    <p>Email address</p>
                </li>
                <li>
                    <p>First name and last name</p>
                </li>
                <li>
                    <p>Phone number</p>
                </li>
                <li>
                    <p>Address, State, Province, ZIP/Postal code, City</p>
                </li>
                <li>
                    <p>Usage Data</p>
                </li>
            </ul>
            <Typography variant="h5">Usage Data</Typography>
            <p>Usage Data is collected automatically when using the Service.</p>
            <p>Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
            <p>When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.</p>
            <p>We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or through a mobile device.</p>
            <Typography variant="h5">Tracking Technologies and Cookies</Typography>
            <p>We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our Service. The technologies We use may include:</p>
            <ul>
                <li><strong>Cookies or Browser Cookies.</strong> A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of our Service. Unless you have adjusted Your browser setting so that it will refuse Cookies, our Service may use Cookies.</li>
                <li><strong>Flash Cookies.</strong> Certain features of our Service may use local stored objects (or Flash Cookies) to collect and store information about Your preferences or Your activity on our Service. Flash Cookies are not managed by the same browser settings as those used for Browser Cookies. For more information on how You can delete Flash Cookies, please read &quot;Where can I change the settings for disabling, or deleting local shared objects?&quot; available at <a href="https://helpx.adobe.com/flash-player/kb/disable-local-shared-objects-flash.html#main_Where_can_I_change_the_settings_for_disabling__or_deleting_local_shared_objects_">https://helpx.adobe.com/flash-player/kb/disable-local-shared-objects-flash.html#main_Where_can_I_change_the_settings_for_disabling__or_deleting_local_shared_objects_</a></li>
                <li><strong>Web Beacons.</strong> Certain sections of our Service and our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages or opened an email and for other related website statistics (for example, recording the popularity of a certain section and verifying system and server integrity).</li>
            </ul>
            <p>Cookies can be &quot;Persistent&quot; or &quot;Session&quot; Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser. You can learn more about cookies here: <a href="https://www.termsfeed.com/blog/cookies/">All About Cookies by TermsFeed</a>.</p>
            <p>We use both Session and Persistent Cookies for the purposes set out below:</p>
            <ul>
                <li>
                    <p><strong>Necessary / Essential Cookies</strong></p>
                    <p>Type: Session Cookies</p>
                    <p>Administered by: Us</p>
                    <p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p>
                </li>
                <li>
                    <p><strong>Cookies Policy / Notice Acceptance Cookies</strong></p>
                    <p>Type: Persistent Cookies</p>
                    <p>Administered by: Us</p>
                    <p>Purpose: These Cookies identify if users have accepted the use of cookies on the Website.</p>
                </li>
                <li>
                    <p><strong>Functionality Cookies</strong></p>
                    <p>Type: Persistent Cookies</p>
                    <p>Administered by: Us</p>
                    <p>Purpose: These Cookies allow us to remember choices You make when You use the Website, such as remembering your login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter your preferences every time You use the Website.</p>
                </li>
            </ul>
            <p>For more information about the cookies we use and your choices regarding cookies, please visit our Cookies Policy or the Cookies section of our Privacy Policy.</p>
            <Typography variant="h4">Use of Your Personal Data</Typography>
            <p>The Company may use Personal Data for the following purposes:</p>
            <ul>
                <li>
                    <p><strong>To provide and maintain our Service</strong>, including to monitor the usage of our Service.</p>
                </li>
                <li>
                    <p><strong>To manage Your Account:</strong> to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.</p>
                </li>
                <li>
                    <p><strong>For the performance of a contract:</strong> the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.</p>
                </li>
                <li>
                    <p><strong>To contact You:</strong> To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.</p>
                </li>
                <li>
                    <p><strong>To provide You</strong> with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such information.</p>
                </li>
                <li>
                    <p><strong>To manage Your requests:</strong> To attend and manage Your requests to Us.</p>
                </li>
                <li>
                    <p><strong>For business transfers:</strong> We may use Your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the assets transferred.</p>
                </li>
                <li>
                    <p><strong>For other purposes</strong>: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products, services, marketing and your experience.</p>
                </li>
            </ul>
            <p>We may share Your personal information in the following situations:</p>
            <ul>
                <li><strong>With Service Providers:</strong> We may share Your personal information with Service Providers to monitor and analyze the use of our Service,  to contact You.</li>
                <li><strong>For business transfers:</strong> We may share or transfer Your personal information in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.</li>
                <li><strong>With Affiliates:</strong> We may share Your information with Our affiliates, in which case we will require those affiliates to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or other companies that We control or that are under common control with Us.</li>
                <li><strong>With business partners:</strong> We may share Your information with Our business partners to offer You certain products, services or promotions.</li>
                <li><strong>With other users:</strong> when You share personal information or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside. If You interact with other users or register through a Third-Party Social Media Service, Your contacts on the Third-Party Social Media Service may see Your name, profile, pictures and description of Your activity. Similarly, other users will be able to view descriptions of Your activity, communicate with You and view Your profile.</li>
                <li><strong>With Your consent</strong>: We may disclose Your personal information for any other purpose with Your consent.</li>
            </ul>
            <Typography variant="h4">Retention of Your Personal Data</Typography>
            <p>The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.</p>
            <p>The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service, or We are legally obligated to retain this data for longer time periods.</p>
            <Typography variant="h4">Transfer of Your Personal Data</Typography>
            <p>Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from Your jurisdiction.</p>
            <p>Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.</p>
            <p>The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of Your data and other personal information.</p>
            <Typography variant="h4">Disclosure of Your Personal Data</Typography>
            <Typography variant="h5">Business Transactions</Typography>
            <p>If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.</p>
            <Typography variant="h5">Law enforcement</Typography>
            <p>Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).</p>
            <Typography variant="h5">Other legal requirements</Typography>
            <p>The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:</p>
            <ul>
                <li>Comply with a legal obligation</li>
                <li>Protect and defend the rights or property of the Company</li>
                <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                <li>Protect the personal safety of Users of the Service or the public</li>
                <li>Protect against legal liability</li>
            </ul>
            <Typography variant="h4">Security of Your Personal Data</Typography>
            <p>The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.</p>
            <Typography variant="h3">Links to Other Websites</Typography>
            <p>Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.</p>
            <p>We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.</p>
            <Typography variant="h3">Changes to this Privacy Policy</Typography>
            <p>We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.</p>
            <p>We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the &quot;Last updated&quot; date at the top of this Privacy Policy.</p>
            <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>

            {/* =============================================================================================
                =========================================Start GDPR==============================================
                =================================================================================================*/}

            <Typography variant="h3">GDPR</Typography>
            <p>The General Data Protection Regulation (GDPR) went into effect on May 25, 2018, replacing the 1995 EU Data Protection Directive. The GDPR lays out specific requirements for businesses and organizations who are established in Europe or who serve users in Europe. It regulates how businesses can collect, use, and store personal data.</p>
            <Typography variant="h4">Terms and contractual protections</Typography>
            <p>{BUSINESS_NAME} and the customer have entered into an agreement for the provision of Processor Services. If you are accepting these Data Processing Terms, you warrant that: (a) you have full legal authority to bind to these Data Processing Terms; (b) you have read and understand these Data Processing Terms; and (c) you agree to these Data Processing Terms.</p>
            <Typography variant="h5">Processing of Data</Typography>
            <ul>
                <li><strong>Roles and Regulatory Compliance; Authorization</strong>.</li>
                <ul>
                    <li><strong>Processor and Controller Responsibilities</strong>. The parties acknowledge and agree that:</li>
                    <ul>
                        <li>{BUSINESS_NAME} is a processor of Customer Personal Data under the European Data Protection Legislation</li>
                        <li>Customer is a controller or processor, as applicable, of Customer Personal Data under the European Data Protection Legislation</li>
                        <li>Each party will comply with the obligations applicable to it under the European Data Protection Legislation with respect to the processing of Customer Personal Data</li>
                    </ul>
                    <li><strong>Authorization by Third Party Controller</strong>. If the customer is a processor, the customer warrants to {BUSINESS_NAME} that the customer's instructions and actions with respect to Customer Personal Data, including its appointment of {BUSINESS_NAME} as another processor, have been authorized by the relevant controller.</li>
                </ul>
                <li><strong>Customer's Instructions</strong>. By entering into these Data Processing Terms, Customer instructs {BUSINESS_NAME} to process Customer Personal Data only in accordance with applicable law.</li>
                <li><strong>{BUSINESS_NAME}'s Compliance with Instructions</strong>. {BUSINESS_NAME} will comply with the instructions described in Customer's Instructions, unless European or National Laws to which {BUSINESS_NAME} is subject require other processing of Customer Personal Data by {BUSINESS_NAME}, in which case {BUSINESS_NAME} will inform the customer (unless any such law prohibits {BUSINESS_NAME} from doing so on important grounds of public interest).</li>
                <li><strong>Additional Products</strong>. If the customer uses and Additional Product, the Processor Services may allow that Additional Product to access Customer Personal Data as required for the interpolation of the Additional Product with the Processor Services.</li>

            </ul>
            <Typography variant="h5">Data Deletion</Typography>
            <ul>
                <li><strong>Deletion During Term</strong>
                    <ul>
                        <li><strong>Processor Services With Deletion Functionality</strong>. During the Term, if:
                        <ul>
                                <li>the functionality of the Processor Services includes the option for Customer to delete Customer Personal Data;</li>
                                <li>Customer uses the Processor Services to delete certain Customer Personal Data; and</li>
                                <li>the deleted Customer Personal Data cannot be recovered by Customer (for example, from the “trash”),</li>
                            </ul>
                            <p>then {BUSINESS_NAME} will delete such Customer Personal Data from its systems as soon as reasonably practicable and within a maximum period of 180 days, unless European or National Laws require storage.</p>
                        </li>
                        <li><strong>Processor Services Without Deletion Functionality</strong>. During the Term, if the functionality of the Processor Services does not include the option for Customer to delete Customer Personal Data, then {BUSINESS_NAME} will comply with:
                        <ul>
                                <li>any reasonable request from Customer to facilitate such deletion, insofar as this is possible taking into account the nature and functionality of the Processor Services and unless European or National Laws require storage</li>                    </ul>
                        </li>
                    </ul>
                    <p>{BUSINESS_NAME} may charge a fee (based on {BUSINESS_NAME}'s reasonable costs) for any data deletion under this section. Ne Life Nursery will provide Customer with further details of any applicable fee, and the basis of its calculation, in advance of any such data deletion</p>

                </li>
                <li><strong>Deletion on Term Expirty</strong>. On expiry of the Term, Customer instructs {BUSINESS_NAME} to delete all Customer Personal Data (including existing copies) from {BUSINESS_NAME}'s systems in accordance with applicable law.  will comply with this instruction as soon as reasonably practicable and within a maximum period of 180 days, unless European or National Laws require storage.</li>

            </ul>

            {/* =============================================================================================
                ==========================================End GDPR===============================================
                =================================================================================================*/}

            {/* =============================================================================================
                =========================================Start CCPA==============================================
                =================================================================================================*/}

            <Typography variant="h3">California Requirements</Typography>
            <p>The California Consumer Privacy Act (CCPA) requires specific disclosures for California residents.</p>
            <p>This Privacy Policy is designed to help you understand how {BUSINESS_NAME} handles your information:</p>
            <ul>
                <li>We explain the categories of information {BUSINESS_NAME} collects and the sources of that information</li>
                <li>We explain how {BUSINESS_NAME} uses information</li>
                <li>We explain when {BUSINESS_NAME} may share information</li>
            </ul>
            <p>The CCPA also provides the right to request information about how {BUSINESS_NAME} collects, uses, and discloses your personal information. And it gives you the right to access your information and request that {BUSINESS_NAME} delete that information. Finally, the CCPA provides the right to not be discriminated against for exercising your privacy rights</p>
            <p>We describe the choices you have to manage your privacy and data across {BUSINESS_NAME}'s services</p>
            <Typography variant="h4">Categories of personal information we collect</Typography>
            <ul>
                <li><strong>Identifiers</strong> such as your name, phone number, and email address</li>
                <li><strong>Demographic information</strong>, such as your language</li>
                <li><strong>Commercial information</strong>, such as your payment information and order history</li>
                <li><strong>Other information you create or provide</strong>, such as the content you upload (like photos or comments)</li>
                <li><strong>Inferences</strong> drawn from the above</li>
            </ul>
            <Typography variant="h4">Business purposes for which information may be used or disclosed</Typography>
            <ul>
                <li><strong>Protecting against security threats, abuse, and illegal activity</strong>: {BUSINESS_NAME} may disclose information to detect, prevent, and respond to security incidents, and for protecting against other malicious, deceptive, fraudulent, or illegal activity.</li>
                <li><strong>Auditing and measurement</strong>: {BUSINESS_NAME} uses information for analytics and measurement to understand how our services are used, as well as to fulfill obligations to our partners like advertisers, developers, or rights holders. We may disclose non-personally identifiable information publicly and with these partners, including for auditing purposes</li>
                <li><strong>Maintaining our services</strong>: {BUSINESS_NAME} uses information to ensure our services are working as intended, such as tracking outages or troubleshooting bugs and others issues that you report to us.</li>
                <li><strong>Research and development</strong>: {BUSINESS_NAME} uses information to improve our services and to develop new products, features, and technologies that benefit our users and the public</li>
                <li><strong>Use of service providers</strong>: {BUSINESS_NAME} may share information with service providers to perform services on our behalf, in compliance with our Privacy Policy and other appropriate confidentiality and security measures.</li>
                <li><strong>Legal reasons</strong>: {BUSINESS_NAME} also uses information to satisfy applicable laws or regulations, and discloses information in response to legal process or enforceable government requests, including to law enforcement.</li>
            </ul>
            <Typography variant="h4">Partners with whom information may be shared</Typography>
            <ul>
                <li><strong>Other people with whom you choose to share your information</strong></li>
                <li><strong>Third parties to whom you consent to sharing your information</strong></li>
                <li><strong>Service providers</strong>, trusted businesses or persons that process information on {BUSINESS_NAME}'s behalf, based on our instructinos and in compliance with our Privacy Policy and any other appropriate confidentiality and security measures</li>
                <li><strong>Law enforcement or other third parties</strong>, for the legal reasons described in the "Business purposes for which information may be used or disclosed" section.</li>
            </ul>

            {/* =============================================================================================
                =========================================End CCPA================================================
                =================================================================================================*/}

            {/* =============================================================================================
                ==============================Start when this policy applies=====================================
                =================================================================================================*/}

            <Typography variant="h3">When this policy applies</Typography>
            <p>This Privacy Policy applies to all of the services offered by {FULL_BUSINESS_NAME}. and its affiliates. This Privacy Policy does not apply to services that have separate privacy policies that do not incorporate this Privacy Policy.</p>
            <p>This Privacy Policy does not apply to:</p>
            <ul>
                <li>The information practices of other companies and organizations that advertize our services</li>
                <li>Services offered by other companies or individuals, including products or sites that may include {BUSINESS_NAME} services, be displayed to you in search results, or be linked from our services.</li>
            </ul>

            {/* =============================================================================================
                ==============================End when this policy applies=======================================
                =================================================================================================*/}

            {/* =============================================================================================
                ======================================Start Contact Us===========================================
                =================================================================================================*/}

            <Typography variant="h3">Contact Us</Typography>
            <p>If you have any questions about this Privacy Policy, You can contact us:</p>
            <ul>
                <li>
                    <p>By email: <a href="mailto:info@newlifenurseryinc.com">info@newlifenurseryinc.com</a></p>
                </li>
                <li>
                    <p>By visiting this page on our website: <a href="https://newlifenurseryinc.com/contact">https://newlifenurseryinc.com/contact</a></p>
                </li>
                <li>
                    <p>By phone number: <a href="tel:+18564553601">(856) 455-3601</a></p>
                </li>
            </ul>

            {/* =============================================================================================
                =======================================End Contact Us============================================
                =================================================================================================*/}
        </div>
    );
}

PrivacyPolicyPage.propTypes = {
    
}

export default PrivacyPolicyPage;