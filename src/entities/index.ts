export type Person = {
    id?: number;
    firstname: string;
    middlename?: string | null;
    lastname: string;
    sex: "MALE" | "FEMALE";
    profileImageURL?: string;
    timeAdded?: Date;
};

export type Guard = {
    id?: string;
    email: string;
    password: string;
    isAdmin?: boolean;
    isDisabled?: boolean;
    personId: number;
};
