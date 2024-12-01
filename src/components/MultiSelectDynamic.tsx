import React, { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
interface Option {
    value: string;
    text: string;
    selected: boolean;
    element?: HTMLElement;
}

interface DropdownItem {
    id: string;
    name: string;
}

interface DropdownProps {
    id: string;
    label?: string;
    data: DropdownItem[];
    adata?: string;
    apiD?: string;
    name: string;
    side?: boolean;
    button?: boolean;
    handleClick?: () => void;
    options: Option[];
    setOptions: Dispatch<SetStateAction<Option[]>>;
    selected: number[];
    setSelected: Dispatch<SetStateAction<number[]>>;
}

const MultiSelectDynamic: React.FC<DropdownProps> = ({ id, label, data, adata, side, button, handleClick, options, setOptions, selected, setSelected }) => {
    // console.log(data);
    // console.log(adata);
    const [show, setShow] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<any>(null);
    const trigger = useRef<any>(null);

    useEffect(() => {
        const loadOptions = () => {
            const newOptions: Option[] = data.map((item) => ({
                value: item.id,
                text: item.name,
                selected: false,
            }));
            setOptions(newOptions);
        };

        if (data?.length > 0) {
            loadOptions();
        }
    }, [data]);

    useEffect(() => {
        if (adata && options.length > 0) {
            const selectedIds = adata.split(',');
            const newSelected = selectedIds.map(id =>
                options.findIndex(option => option.value === id)
            ).filter(index => index !== -1);

            const updatedOptions = [...options];
            newSelected.forEach(index => {
                if (index !== -1) {
                    updatedOptions[index].selected = true;
                }
            });

            setOptions(updatedOptions);
            setSelected(newSelected);
        }
    }, [adata, options.length]);

    const open = () => {
        setShow(true);
    };

    const isOpen = () => {
        return show === true;
    };

    const select = (index: number, event: React.MouseEvent) => {
        event.stopPropagation();
        
        const newOptions = [...options];

        if (!newOptions[index].selected) {
            newOptions[index].selected = true;
            newOptions[index].element = event.currentTarget as HTMLElement;
            setSelected([...selected, index]);
        } else {
            const selectedIndex = selected.indexOf(index);
            if (selectedIndex !== -1) {
                newOptions[index].selected = false;
                setSelected(selected.filter((i) => i !== index));
            }
        }

        setOptions(newOptions);
    };

    const remove = (index: number) => {
        const newOptions = [...options];
        const selectedIndex = selected.indexOf(index);

        if (selectedIndex !== -1) {
            newOptions[index].selected = false;
            setSelected(selected.filter((i) => i !== index));
            setOptions(newOptions);
        }
    };

    const selectedValues = () => {
        return selected.map((option) => options[option].value);
    };

    const selectAll = () => {
        const allSelected = selected.length === options.length;
        const newOptions = options.map((option) => ({
            ...option,
            selected: !allSelected,
        }));
        setOptions(newOptions);
        setSelected(allSelected ? [] : newOptions.map((_, index) => index));
    };

    // const filteredOptions = options.filter((option) =>
    //     option.text.toLowerCase().includes(searchTerm.toLowerCase())
    // );
    const filteredOptions = options.filter((option) => {
        return option && option.text && option.text.toLowerCase().includes(searchTerm.toLowerCase());
    });

    useEffect(() => {
        const clickHandler = ({ target }: MouseEvent) => {
            if (!dropdownRef.current) return;
            if (
                !show ||
                dropdownRef.current.contains(target) ||
                trigger.current.contains(target)
            )
                return;
            setShow(false);
        };
        document.addEventListener('click', clickHandler);
        return () => document.removeEventListener('click', clickHandler);
    });

    return (
        <>
            <div className="relative">
                {
                    label &&
                    <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                        {label}
                    </label>
                }
                {
                    data &&
                    <select className="hidden" id={id}>
                        {data.map((item, i) =>
                            <option key={i} value={item.id}>{item.name}</option>
                        )}
                    </select>
                }

                <div className={`flex flex-col items-center`}>
                    <input name="values" type="hidden" defaultValue={selectedValues()} />
                    <div className="relative inline-block w-full">
                        <div className="relative flex flex-col items-center">
                            <div ref={trigger} onClick={open} className="w-full">
                                <div className={`mb-2 flex rounded border border-stroke py-2 pl-3 pr-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${side && 'bg-white'}`}>
                                    <div className="flex flex-auto flex-wrap gap-3">
                                        {selected.map((index) => (
                                            <div
                                                key={index}
                                                className="my-1.5 flex items-center justify-center rounded border-[.5px] border-stroke bg-gray px-2.5 py-1.5 text-sm font-medium dark:border-strokedark dark:bg-white/30"
                                            >
                                                <div className="max-w-full flex-initial">
                                                    {options[index].text}
                                                </div>
                                                <div className="flex flex-auto flex-row-reverse">
                                                    <div
                                                        onClick={() => remove(index)}
                                                        className="cursor-pointer pl-2 hover:text-danger"
                                                    >
                                                        <svg
                                                            className="fill-current"
                                                            role="button"
                                                            width="12"
                                                            height="12"
                                                            viewBox="0 0 12 12"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                clipRule="evenodd"
                                                                d="M9.35355 3.35355C9.54882 3.15829 9.54882 2.84171 9.35355 2.64645C9.15829 2.45118 8.84171 2.45118 8.64645 2.64645L6 5.29289L3.35355 2.64645C3.15829 2.45118 2.84171 2.45118 2.64645 2.64645C2.45118 2.84171 2.45118 3.15829 2.64645 3.35355L5.29289 6L2.64645 8.64645C2.45118 8.84171 2.45118 9.15829 2.64645 9.35355C2.84171 9.54882 3.15829 9.54882 3.35355 9.35355L6 6.70711L8.64645 9.35355C8.84171 9.54882 9.15829 9.54882 9.35355 9.35355C9.54882 9.15829 9.54882 8.84171 9.35355 8.64645L6.70711 6L9.35355 3.35355Z"
                                                                fill="currentColor"
                                                            ></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {selected.length === 0 && (
                                            <div className="flex-1">
                                                <input
                                                    placeholder="Select an option"
                                                    className="h-full w-full appearance-none bg-transparent p-1 px-2 outline-none"
                                                    defaultValue={selectedValues()}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex w-8 items-center py-1 pl-1 pr-1">
                                        <button
                                            type="button"
                                            onClick={open}
                                            className="h-6 w-6 cursor-pointer outline-none focus:outline-none"
                                        >
                                            <svg
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <g opacity="0.8">
                                                    <path
                                                        fillRule="evenodd"
                                                        clipRule="evenodd"
                                                        d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                        fill="#637381"
                                                    ></path>
                                                </g>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full px-4">
                                <div
                                    className={`max-h-select absolute shadow-lg top-full left-0 z-50 w-full overflow-y-auto rounded bg-white dark:bg-form-input ${isOpen() ? '' : 'hidden'
                                        }`}
                                    ref={dropdownRef}
                                    onFocus={() => setShow(true)}
                                    onBlur={() => setShow(false)}
                                >
                                    <div className="flex w-full flex-col p-2 pb-4">
                                        <div className="mb-2">
                                            <button
                                                type="button"
                                                onClick={selectAll}
                                                className="text-primary"
                                            >
                                                {selected.length === options.length
                                                    ? 'Deselect All'
                                                    : 'Select All'}
                                            </button>
                                        </div>
                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                className="w-full rounded border border-stroke py-1 px-2 outline-none dark:border-form-strokedark dark:bg-form-input"
                                                placeholder="Search..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        {filteredOptions.map((option, index) => {
                                            if (option.selected) return null;
                                            
                                            return (
                                                <div key={index}>
                                                    <div
                                                        className="w-full cursor-pointer rounded-t border-b border-stroke hover:bg-primary/5 dark:border-form-strokedark"
                                                        onClick={(event) => select(index, event)}
                                                    >
                                                        <div
                                                            className={`relative flex w-full items-center border-l-2 border-transparent p-2 pl-2 ${option.selected ? 'border-primary' : ''}`}
                                                        >
                                                            <div className="flex w-full items-center">
                                                                <div className="mx-2 text-sm">
                                                                    {option.text}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    button &&
                    <button onClick={handleClick} className={`px-4 rounded bg-blue-700 text-white inline-block ${side ? 'py-3 ml-3' : 'py-1.5'}`}>Submit</button>
                }
            </div>
        </>

    );
};

export default MultiSelectDynamic;