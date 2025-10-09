import StoreForm from '@/components/store/StoreForm';
import SideBar from '@/components/ui/SideBar';
import React from 'react'

const StoreConfPage = ({store, setStore, handleSave, saving}) => {
    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <SideBar />
            <main className="flex-1 p-8 h-screen overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <StoreForm 
                        store={store}
                        onChange={setStore}
                        onSave={handleSave}
                        loading={saving}
                    />
                </div>
            </main>
        </div>
    )
}

export default StoreConfPage;