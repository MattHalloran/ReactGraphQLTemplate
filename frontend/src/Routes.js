import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { LINKS, USER_ROLES, BUSINESS_NAME } from 'utils/consts';
import { RequireAuthentication } from 'components';
import Sitemap from 'Sitemap';
import { 
    AboutPage,
    AdminContactPage,
    AdminCustomerPage,
    AdminGalleryPage,
    AdminMainPage,
    AdminInventoryPage,
    AdminOrderPage,
    CartPage,
    FormPage,
    GalleryPage,
    HomePage,
    NotFoundPage,
    Page,
    PrivacyPolicyPage,
    ShoppingPage,
    TermsPage,
} from 'pages';
import {
    ForgotPasswordForm,
    LogInForm,
    ProfileForm,
    SignUpForm
} from 'forms';

function Routes({
    session,
    roles,
    cart,
}) {
    return (
        <Switch>
            {/* START PUBLIC PAGES */}
            <Route 
                path="/sitemap" 
                component={Sitemap}
            />
            <Route 
                exact 
                path={LINKS.Home} 
                sitemapIndex={true} 
                priority={1.0} 
                changefreq="monthly"
                render={() => (
                    <Page title={`Home | ${BUSINESS_NAME.Short}`}>
                        <HomePage />
                    </Page>
                )}
            />
            <Route 
                exact 
                path={LINKS.About} 
                sitemapIndex={true} 
                priority={0.7} 
                render={() => (
                    <Page title={`About | ${BUSINESS_NAME.Short}`}>
                        <AboutPage />
                    </Page>
                )}
            />
            <Route 
                exact 
                path={LINKS.PrivacyPolicy} 
                sitemapIndex={true} 
                priority={0.1} 
                render={() => (
                    <Page title={`Privacy Policy | ${BUSINESS_NAME.Short}`}>
                        <PrivacyPolicyPage />
                    </Page>
                )}
            />
            <Route 
                exact 
                path={LINKS.Terms} 
                sitemapIndex={true} 
                priority={0.1} 
                render={() => (
                    <Page title={`Terms & Conditions | ${BUSINESS_NAME.Short}`}>
                        <TermsPage />
                    </Page>
                )}
            />
            <Route 
                exact 
                path={`${LINKS.Gallery}/:img?`} 
                sitemapIndex={true} 
                priority={0.3} 
                render={() => (
                    <Page title={`Gallery | ${BUSINESS_NAME.Short}`}>
                        <GalleryPage />
                    </Page>
                )}
            />
            <Route 
                exact 
                path={LINKS.Register} 
                sitemapIndex={true} 
                priority={0.9} 
                render={() => (
                    <FormPage title="Sign Up" maxWidth="700px">
                        <SignUpForm />
                    </FormPage>
                )} 
            />
            <Route 
                exact 
                path={`${LINKS.LogIn}/:code?`} 
                sitemapIndex={true} 
                priority={0.8} 
                render={() => (
                    <FormPage title="Log In" maxWidth="700px">
                        <LogInForm />
                    </FormPage>
                )} 
            />
            <Route 
                exact 
                path={`${LINKS.ForgotPassword}/:code?`} 
                sitemapIndex={true} 
                priority={0.1} 
                render={() => (
                    <FormPage title="Forgot Password" maxWidth="700px">
                        <ForgotPasswordForm />
                    </FormPage>
                )} 
            />
            {/* END PUBLIC PAGES */}
            {/* START CUSTOMER PAGES */}
            <Route 
                exact 
                path={LINKS.Profile} 
                sitemapIndex={true} 
                priority={0.4} 
                render={() => (
                    <RequireAuthentication roles={roles} role={USER_ROLES.Customer}>
                        <FormPage title="Profile">
                            <ProfileForm session={session} />
                        </FormPage>
                    </RequireAuthentication>
                )} 
            />
            <Route 
                exact 
                path={`${LINKS.Shopping}/:sku?`} 
                sitemapIndex={true} 
                priority={0.9} 
                render={() => (
                    <Page title={`Shop | ${BUSINESS_NAME.Short}`}>
                        <ShoppingPage session={session} cart={cart} />
                    </Page>
                )} 
            />
            <Route 
                exact 
                path={LINKS.Cart} 
                render={() => (
                    <Page title={`Cart | ${BUSINESS_NAME.Short}`}>
                        <CartPage session={session} cart={cart} />
                    </Page>
                )} 
            />
            {/* END CUSTOMER PAGES */}
            {/* START ADMIN PAGES */}
            <Route 
                exact 
                path={LINKS.Admin} 
                render={() => (
                    <RequireAuthentication roles={roles} role={USER_ROLES.Admin}>
                        <Page title={`Admin Portal | ${BUSINESS_NAME.Short}`}>
                            <AdminMainPage />
                        </Page>
                    </RequireAuthentication>
                )} 
            />
            <Route 
                exact 
                path={LINKS.AdminContactInfo} 
                render={() => (
                    <RequireAuthentication roles={roles} role={USER_ROLES.Admin}>
                        <Page title={"Edit Contact Info"}>
                            <AdminContactPage />
                        </Page>
                    </RequireAuthentication>
                )} 
            />
            <Route exact path={LINKS.AdminCustomers} render={() => (
                <RequireAuthentication roles={roles} role={USER_ROLES.Admin}>
                    <Page title={"Customer Page"}>
                        <AdminCustomerPage session={session} />
                    </Page>
                </RequireAuthentication>
            )} />
            <Route exact path={LINKS.AdminGallery} render={() => (
                <RequireAuthentication roles={roles} role={USER_ROLES.Admin}>
                    <Page title={"Edit Gallery"}>
                        <AdminGalleryPage session={session} />
                    </Page>
                </RequireAuthentication>
            )} />
            <Route exact path={LINKS.AdminInventory} render={() => (
                <RequireAuthentication roles={roles} role={USER_ROLES.Admin}>
                    <Page title={"Edit Inventory Info"}>
                        <AdminInventoryPage session={session} />
                    </Page>
                </RequireAuthentication>
            )} />
            <Route exact path={LINKS.AdminOrders} render={() => (
                <RequireAuthentication roles={roles} role={USER_ROLES.Admin}>
                    <Page title={"Order Page"}>
                        <AdminOrderPage session={session} />
                    </Page>
                </RequireAuthentication>
            )} />
            {/* END ADMIN PAGES */}
            {/* 404 page */}
            <Route
                render={() => (
                    <Page title={`404 | ${BUSINESS_NAME.Short}`}>
                        <NotFoundPage />
                    </Page>
                )}  
            />
        </Switch>
    );
}

Routes.propTypes = {
    session: PropTypes.object,
    roles: PropTypes.array,
    cart: PropTypes.object,
}

export default Routes;