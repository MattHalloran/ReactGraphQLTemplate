import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { LINKS, USER_ROLES } from 'utils/consts';
import RequireAuthentication from 'components/wrappers/RequireAuthentication/RequireAuthentication';
import Sitemap from 'Sitemap';
import FormPage from 'pages/FormPage/FormPage';
import HomePage from 'pages/HomePage/HomePage';
import AboutPage from 'pages/AboutPage/AboutPage';
import CartPage from 'pages/CartPage/CartPage';
import GalleryPage from 'pages/GalleryPage/GalleryPage';
import ShoppingPage from 'pages/shopping/ShoppingPage/ShoppingPage';
import PrivacyPolicyPage from 'pages/PrivacyPolicyPage/PrivacyPolicyPage';
import TermsPage from 'pages/TermsPage/TermsPage';
import AdminMainPage from 'pages/admin/AdminMainPage/AdminMainPage';
import AdminContactPage from 'pages/admin/AdminContactPage/AdminContactPage';
import AdminCustomerPage from 'pages/admin/AdminCustomerPage/AdminCustomerPage';
import AdminGalleryPage from 'pages/admin/AdminGalleryPage/AdminGalleryPage';
import AdminInventoryPage from 'pages/admin/AdminInventoryPage/AdminInventoryPage';
import AdminOrderPage from 'pages/admin/AdminOrderPage/AdminOrderPage';
import NotFoundPage from 'pages/NotFoundPage/NotFoundPage';
import ProfileForm from 'forms/ProfileForm/ProfileForm';
import SignUpForm from 'forms/SignUpForm/SignUpForm';
import LogInForm from 'forms/LogInForm/LogInForm';
import ForgotPasswordForm from 'forms/ForgotPasswordForm/ForgotPasswordForm';

function Routes({
    session,
    user_roles,
}) {
    return (
        <Switch>
            {/* public pages */}
            <Route exact path={LINKS.Home} component={HomePage} sitemapIndex={true} priority={1.0} changefreq="monthly"/>
            <Route path="/sitemap" component={Sitemap}/>
            <Route exact path={LINKS.About} component={AboutPage} sitemapIndex={true} priority={0.7} />
            <Route exact path={LINKS.PrivacyPolicy} component={PrivacyPolicyPage} sitemapIndex={true} priority={0.1} />
            <Route exact path={LINKS.Terms} component={TermsPage} sitemapIndex={true} priority={0.1} />
            <Route exact path={`${LINKS.Gallery}/:img?`} component={GalleryPage} sitemapIndex={true} priority={0.3} />
            <Route exact path={LINKS.Register} sitemapIndex={true} priority={0.9} render={() => (
                <FormPage header="Sign Up" maxWidth="700px">
                    <SignUpForm />
                </FormPage>
            )} />
            <Route exact path={`${LINKS.LogIn}/:code?`} sitemapIndex={true} priority={0.8} render={() => (
                <FormPage header="Log In" maxWidth="700px">
                    <LogInForm />
                </FormPage>
            )} />
            <Route exact path={`${LINKS.ForgotPassword}/:code?`} sitemapIndex={true} priority={0.1} render={() => (
                <FormPage header="Forgot Password" maxWidth="700px">
                    <ForgotPasswordForm />
                </FormPage>
            )} />
            {/* customer pages */}
            <Route exact path={LINKS.Profile} sitemapIndex={true} priority={0.4} render={() => (
                <RequireAuthentication role={USER_ROLES.Customer}>
                    <FormPage header="Profile">
                        <ProfileForm session={session} />
                    </FormPage>
                </RequireAuthentication>
            )} />
            <Route exact path={`${LINKS.Shopping}/:sku?`} sitemapIndex={true} priority={0.9} render={() => (
                <ShoppingPage user_roles={user_roles} session={session} />
            )} />
            <Route exact path={LINKS.Cart} render={() => (
                <CartPage user_roles={user_roles} session={session} />
            )} />
            {/* admin pages */}
            <Route exact path={LINKS.Admin} render={() => (
                <RequireAuthentication role={USER_ROLES.Admin}>
                    <AdminMainPage />
                </RequireAuthentication>
            )} />
            <Route exact path={LINKS.AdminContactInfo} render={() => (
                <RequireAuthentication role={USER_ROLES.Admin}>
                    <AdminContactPage />
                </RequireAuthentication>
            )} />
            <Route exact path={LINKS.AdminCustomers} render={() => (
                <RequireAuthentication role={USER_ROLES.Admin}>
                    <AdminCustomerPage session={session} />
                </RequireAuthentication>
            )} />
            <Route exact path={LINKS.AdminGallery} render={() => (
                <RequireAuthentication role={USER_ROLES.Admin}>
                    <AdminGalleryPage session={session} />
                </RequireAuthentication>
            )} />
            <Route exact path={LINKS.AdminInventory} render={() => (
                <RequireAuthentication role={USER_ROLES.Admin}>
                    <AdminInventoryPage />
                </RequireAuthentication>
            )} />
            <Route exact path={LINKS.AdminOrders} render={() => (
                <RequireAuthentication role={USER_ROLES.Admin}>
                    <AdminOrderPage />
                </RequireAuthentication>
            )} />
            {/* 404 page */}
            <Route component={NotFoundPage} />
        </Switch>
    );
}

Routes.propTypes = {
    session: PropTypes.object,
    user_roles: PropTypes.object,
}

export default Routes;