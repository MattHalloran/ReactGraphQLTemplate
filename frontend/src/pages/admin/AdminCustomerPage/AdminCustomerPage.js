import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { StyledAdminCustomerPage, StyledCustomerCard } from './AdminCustomerPage.styled';
import PropTypes from 'prop-types';
import { getCustomers, modifyUser } from 'query/http_promises';
import { ACCOUNT_STATUS, PUBS } from 'utils/consts';
import { getSession, getTheme } from 'utils/storage';
import Button from 'components/Button/Button';
import { PubSub } from 'utils/pubsub';

function AdminCustomerPage() {
    const [theme, setTheme] = useState(getTheme());
    const [session, setSession] = useState(getSession());
    const [customers, setCustomers] = useState([]);
    const [selected, setSelected] = useState(-1);

    useEffect(() => {
        let themeSub = PubSub.subscribe(PUBS.Theme, (_, o) => setTheme(o));
        let sessionSub = PubSub.subscribe(PUBS.Session, (_, o) => setSession(0));
        return (() => {
            PubSub.unsubscribe(themeSub);
            PubSub.unsubscribe(sessionSub);
        })
    }, [])

    useLayoutEffect(() => {
        let mounted = true;
        document.title = "Customer Page";
        getCustomers(session?.email, session?.token)
            .then((response) => {
                if (!mounted) return;
                setCustomers(response.customers);
            })
            .catch((error) => {
                console.error("Failed to load filters", error);
            });
        return () => mounted = false;
    }, [session])

    const select_user = useCallback((id) => {
        setSelected(customers.map(c => c.id).indexOf(id));
    }, [customers])

    const approve_user = useCallback(() => {
        modifyUser(session?.email, session?.token, customers[selected]?.id, 'APPROVE')
            .then(response => {
                setCustomers(response.customers);
            })
            .catch(err => {
                console.error(err);
                alert('Error: Failed to approve user!');
            });
    }, [selected])

    const unlock_user = useCallback(() => {
        modifyUser(session?.email, session?.token, customers[selected]?.id, 'UNLOCK')
            .then(response => {
                setCustomers(response.customers);
            })
            .catch(err => {
                console.error(err);
                alert('Error: Failed to unlock user!');
            });
    }, [selected])

    const lock_user = useCallback(() => {
        modifyUser(session?.email, session?.token, customers[selected]?.id, 'LOCK')
            .then(response => {
                setCustomers(response.customers);
            })
            .catch(err => {
                console.error(err);
                alert('Error: Failed to lock user!');
            });
    }, [selected])

    const delete_user = useCallback(() => {
        if (!window.confirm(`Are you sure you want to delete the account for ${selected?.first_name} ${selected?.last_name}?`)) return;
        modifyUser(session?.email, session?.token, customers[selected]?.id, 'DELETE')
            .then(response => {
                setCustomers(response.customers);
            })
            .catch(err => {
                console.error(err);
                alert('Error: Failed to delete user!');
            });
    }, [selected]);


    let approve_button = [approve_user, 'Approve'];
    let unlock_button = [unlock_user, 'Unlock'];
    let lock_button = [lock_user, 'Lock'];
    let delete_button = [delete_user, 'Delete'];

    let account_options = [];
    let selected_display = '';
    if (selected >= 0) {
        selected_display = `${customers[selected]?.first_name} ${customers[selected]?.last_name}`
        switch (customers[selected]?.account_status) {
            case ACCOUNT_STATUS.Unlocked:
                account_options = [lock_button, delete_button]
                break;
            case ACCOUNT_STATUS.WaitingApproval:
                account_options = [approve_button, delete_button]
                break;
            case ACCOUNT_STATUS.SoftLock:
            case ACCOUNT_STATUS.HardLock:
                account_options = [unlock_button, delete_button]
                break;
        }
    }

    return (
        <StyledAdminCustomerPage className="page" theme={theme}>
            <div>
                <h1>Selected user: {selected_display}</h1>
                {account_options?.map((o, index) => <Button key={index} onClick={o[0]}>{o[1]}</Button>)}
            </div>
            <div className="card-flex">
                {customers.map((c, index) => <CustomerCard key={index} onClick={select_user} {...c} />)}
            </div>
        </StyledAdminCustomerPage >
    );
}

AdminCustomerPage.propTypes = {
    session: PropTypes.object.isRequired,
    theme: PropTypes.object,
}

export default AdminCustomerPage;

function CustomerCard({
    id,
    first_name,
    last_name,
    account_status,
    onClick,
    theme = getTheme(),
}) {
    return (
        <StyledCustomerCard theme={theme} account_status={account_status} onClick={() => onClick(id)}>
            <p>Name: {first_name} {last_name}</p>
        </StyledCustomerCard>
    );
}

CustomerCard.propTypes = {
    id: PropTypes.number,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    account_status: PropTypes.number,
    onClick: PropTypes.func,
}