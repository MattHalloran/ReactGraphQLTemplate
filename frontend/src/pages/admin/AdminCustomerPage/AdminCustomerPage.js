import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { StyledAdminCustomerPage, StyledCustomerCard } from './AdminCustomerPage.styled';
import PropTypes from 'prop-types';
import { getCustomers, modifyUser } from 'query/http_promises';
import { LOCAL_STORAGE, ACCOUNT_STATUS } from 'utils/consts';
import { getItem, getTheme } from 'utils/storage';
import Button from 'components/Button/Button';

function AdminCustomerPage({
    session = getItem(LOCAL_STORAGE.Session),
    theme = getTheme(),
}) {
    console.log('ADMIN CUTOMER PAGE RENDER')
    const [customers, setCustomers] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        console.log("CUSTOMERS UPDATED", customers);
    }, [customers])

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
        let index = customers.map(c => c.id).indexOf(id);
        console.log('SELECT USER', id, index, customers[index]);
        if (id < 0) {
            setSelected(null);
        } else {
            setSelected(customers[index]);
        }
    }, [customers])

    const approve_user = useCallback(() => {
        modifyUser(selected?.id, 'APPROVE');
    }, [selected])

    const unlock_user = useCallback(() => {
        modifyUser(selected?.id, 'UNLOCK');
    }, [selected])

    const lock_user = useCallback(() => {
        modifyUser(selected?.id, 'LOCK');
    }, [selected])

    const delete_user = useCallback(() => {
        if (!window.confirm(`Are you sure you want to delete the account for ${selected?.first_name} ${selected?.last_name}?`)) return;
        modifyUser(selected?.id, 'DELETE');
    }, [selected]);


    let approve_button = [approve_user, 'Approve'];
    let unlock_button = [unlock_user, 'Unlock'];
    let lock_button = [lock_user, 'Lock'];
    let delete_button = [delete_user, 'Delete'];

    const get_account_options = useCallback(() => {
        switch (selected?.account_status) {
            case ACCOUNT_STATUS.Deleted:
                console.log('A')
                return [];
            case ACCOUNT_STATUS.Unlocked:
                console.log('B')
                return [lock_button, delete_button]
            case ACCOUNT_STATUS.WaitingApproval:
                console.log('C')
                return [approve_button, delete_button]
            case ACCOUNT_STATUS.SoftLock:
            case ACCOUNT_STATUS.HardLock:
                console.log('D')
                return [unlock_button, delete_button]
            default:
                console.log('E')
                return [];
        }
    }, [selected, approve_button, delete_button, lock_button, unlock_button]);

    return (
        <StyledAdminCustomerPage className="page" theme={theme}>
            <div>
                {get_account_options().map((o, index) => <Button key={index} onClick={o[0]}>{o[1]}</Button>)}
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
    theme: PropTypes.object,
}